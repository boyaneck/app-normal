import { WebhookReceiver } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";
import { postLiveStats } from "../api/live.js";
const api_key = process.env.LIVEKIT_API_KEY;
const api_secret = process.env.LIVEKIT_API_SECRET;
const receiver = new WebhookReceiver(api_key, api_secret);
const insertAndUpdateObject = (obj = {}, key, value) => {
  return {
    ...obj,
    [key]: value,
  };
};

export const liveParticipantWebhook = async (req, res) => {
  let event;
  try {
    event = await receiver.receive(req.body, req.get("Authorization"));
    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook verification failed", err);
    return res.status(400).send("Invalid Webhook");
  }

  if (!event) return;

  let room_name = event.room?.name || event.ingressInfo?.roomName;

  if (!room_name) {
    console.log(`[Webhook] ${event.event} : room_name을 찾을 수 없음`);
    return;
  }

  const viewer = event.participant ? event.participant.identity : null;

  // Redis 키 정의
  const LIVE_INFO_KEY = `LIVE_INFORMATION:${room_name}`;
  const LIVE_VIEWERS = `LIVE_VIEWERS:${room_name}`;
  const LIVE_PEAK_VIEW = `LIVE_PEAK_VIEW:${room_name}`;
  const LIVE_AVG_RATE = `LIVE_AVG_RATE:${room_name}`;
  const LIVE_STAY_MINUTE = `LIVE_STAY_MINUTE:${room_name}`;
  const LIVE_VIEWER_RANK = `LIVE_VIEWER_RANK`;

  // 🆕 추천 알고리즘용 추가 키
  const LIVE_CATEGORY = `LIVE_CATEGORY:${room_name}`;
  const LIVE_TAGS = `LIVE_TAGS:${room_name}`;
  const LIVE_TIMESERIES = `LIVE_TIMESERIES:${room_name}`;
  const LIVE_CHAT_COUNT = `LIVE_CHAT_COUNT:${room_name}`;

  try {
    switch (event.event) {
      case "ingress_started": {
        const live_started_at = Date.now();
        await redis_client.hSetNX(
          LIVE_INFO_KEY,
          "started_at",
          live_started_at.toString(),
        );

        // 시간 및 날짜 저장
        const now = new Date();
        const kst_time = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const date = kst_time.toISOString().split("T")[0];
        const day_of_week = kst_time.toLocaleDateString("ko-KR", {
          weekday: "long",
        });
        await redis_client.hSet(
          LIVE_INFO_KEY,
          "today",
          `${date}/${day_of_week}`,
        );

        // 🆕 카테고리 저장 (event에서 받아옴)
        const category = event.room?.metadata?.category || "기타";
        await redis_client.set(LIVE_CATEGORY, category);

        // 🆕 태그 저장 (event에서 받아옴)
        const tags = event.room?.metadata?.tags || [];
        if (Array.isArray(tags) && tags.length > 0) {
          await redis_client.sAdd(LIVE_TAGS, tags);
        }

        // 랭킹보드 초기화
        await redis_client.zAdd(LIVE_VIEWER_RANK, {
          score: 0,
          value: room_name,
        });

        // 🆕 시계열 초기 데이터 (시청자 0명)
        await redis_client.zAdd(LIVE_TIMESERIES, {
          score: Date.now(),
          value: "0", // 시청자 0명
        });

        // 🆕 5분마다 시계열 데이터 저장 (백그라운드)
        startTimeseriesRecording(room_name);

        break;
      }

      case "participant_joined": {
        if (!viewer) break;

        const isNewMember = await redis_client.sAdd(LIVE_VIEWERS, viewer);

        if (isNewMember > 0) {
          await redis_client.zIncrBy(LIVE_VIEWER_RANK, 1, room_name);
        }

        // 최대 동시 시청자 수 업데이트
        const current_viewers = await redis_client.sCard(LIVE_VIEWERS);
        const peak_str = await redis_client.hGet(LIVE_PEAK_VIEW, "peak_view");
        const peak_val = peak_str ? parseInt(peak_str, 10) : 0;

        if (current_viewers > peak_val) {
          await redis_client.hSet(
            LIVE_PEAK_VIEW,
            "peak_view",
            current_viewers.toString(),
          );
        }

        // 시청 시작 시간 기록
        await redis_client.hSet(LIVE_AVG_RATE, viewer, Date.now().toString());

        break;
      }

      case "participant_left": {
        if (!viewer) break;

        const removedCount = await redis_client.sRem(LIVE_VIEWERS, viewer);

        if (removedCount > 0) {
          await redis_client.zIncrBy(LIVE_VIEWER_RANK, -1, room_name);

          const currentScore = await redis_client.zScore(
            LIVE_VIEWER_RANK,
            room_name,
          );
          if (currentScore < 0) {
            await redis_client.zAdd(LIVE_VIEWER_RANK, {
              score: 0,
              value: room_name,
            });
          }
        }

        // 시청 지속 시간 체크
        const start_at_str = await redis_client.hGet(LIVE_AVG_RATE, viewer);
        if (start_at_str) {
          const duration = Math.round(
            (Date.now() - parseInt(start_at_str, 10)) / 1000,
          );
          if (duration >= 60) {
            await redis_client.sAdd(LIVE_STAY_MINUTE, viewer);
          }
          await redis_client.hDel(LIVE_AVG_RATE, viewer);
        }

        break;
      }

      case "ingress_ended":
      case "room_finished": {
        // 🆕 시계열 백그라운드 작업 중지
        stopTimeseriesRecording(room_name);

        const peak_viewer =
          (await redis_client.hGet(LIVE_PEAK_VIEW, "peak_view")) || "0";
        const started_at = await redis_client.hGet(LIVE_INFO_KEY, "started_at");
        let start_iso = started_at
          ? new Date(parseInt(started_at, 10)).toISOString()
          : new Date().toISOString();

        await redis_client.zRem(LIVE_VIEWER_RANK, room_name);

        // 통계 API 호출
        await postLiveStats(parseInt(peak_viewer, 10), room_name, start_iso);

        // 리소스 정리
        await redis_client.del(
          LIVE_VIEWERS,
          LIVE_PEAK_VIEW,
          LIVE_INFO_KEY,
          LIVE_AVG_RATE,
          LIVE_STAY_MINUTE,
          LIVE_CATEGORY,
          LIVE_TAGS,
          LIVE_TIMESERIES,
          LIVE_CHAT_COUNT,
        );

        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};

// 🆕 시계열 데이터 기록 (백그라운드)
const timeseriesIntervals = new Map(); // room_name → intervalId

function startTimeseriesRecording(room_name) {
  // 이미 실행 중이면 중복 방지
  if (timeseriesIntervals.has(room_name)) return;

  const LIVE_VIEWERS = `LIVE_VIEWERS:${room_name}`;
  const LIVE_TIMESERIES = `LIVE_TIMESERIES:${room_name}`;

  const intervalId = setInterval(
    async () => {
      try {
        // 현재 시청자 수
        const currentViewers = await redis_client.sCard(LIVE_VIEWERS);
        const timestamp = Date.now();

        // 시계열 데이터 저장 (Sorted Set)
        await redis_client.zAdd(LIVE_TIMESERIES, {
          score: timestamp,
          value: currentViewers.toString(),
        });

        // 오래된 데이터 삭제 (10분 이전 데이터)
        const tenMinutesAgo = timestamp - 10 * 60 * 1000;
        await redis_client.zRemRangeByScore(LIVE_TIMESERIES, 0, tenMinutesAgo);

        console.log(
          `[Timeseries] ${room_name}: ${currentViewers}명 (${new Date(timestamp).toISOString()})`,
        );
      } catch (error) {
        console.error(`[Timeseries Error] ${room_name}:`, error);
      }
    },
    5 * 60 * 1000,
  ); // 5분마다 실행

  timeseriesIntervals.set(room_name, intervalId);
}

function stopTimeseriesRecording(room_name) {
  const intervalId = timeseriesIntervals.get(room_name);
  if (intervalId) {
    clearInterval(intervalId);
    timeseriesIntervals.delete(room_name);
    console.log(`[Timeseries] ${room_name} 기록 중지`);
  }
}
// 🆕 ViewerGrowth 계산 함수 (API에서 호출)
export async function getViewerGrowth(room_name) {
  const LIVE_TIMESERIES = `LIVE_TIMESERIES:${room_name}`;
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  // 최근 5분 데이터 조회
  const recentData = await redis_client.zRangeByScoreWithScores(
    LIVE_TIMESERIES,
    fiveMinutesAgo,
    now,
  );

  if (recentData.length < 2) {
    return 0; // 데이터 부족
  }

  // 가장 오래된 데이터 vs 최신 데이터
  const oldestViewers = parseInt(recentData[0].value, 10);
  const newestViewers = parseInt(recentData[recentData.length - 1].value, 10);

  if (oldestViewers === 0) {
    return newestViewers > 0 ? 1 : 0; // 0명 → N명 = 100% 증가
  }

  // 증가율 계산 (0~1 범위로 정규화)
  const growth = (newestViewers - oldestViewers) / oldestViewers;
  return Math.max(0, Math.min(1, growth)); // 0~1 클램핑
}
//현재 방의 방송시작 시간 저장------
//평균 시청 지속률
//나중에 같은 유저가 여러번 같은방송에 들어왔을때, 해당 값을 어떻게 처리할지에 대해 생각하기
//어떤때는 그냥 들어와서 보기만하는데 ,어떤때는 들어왔는데, 더 짧은시간이지만,채팅,후원을 할 수 있기에에

// 이제 여기서 1분이상 머문사람을 set 에 넣어놓았으니까, 그거를 1분이상 머문사람/총 왔다갔다 한사람
//------------단순하게 몇분 머물렀다는것이 아닌 해당 기준을 충족하면 평균 시청 지속률 SET에 저장해 놓고 함
//시청 지속률
// conn_keep_rate = await redis_client.scan(
//   `${room_name}:${parti}:duration`
// );
//가능하다면 그 값중에 평균 지속시간도 오도록
