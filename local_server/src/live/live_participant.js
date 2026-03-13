import { WebhookReceiver } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";
import { postLiveStats } from "../api/live.js";

const api_key = process.env.LIVEKIT_API_KEY;
const api_secret = process.env.LIVEKIT_API_SECRET;
const receiver = new WebhookReceiver(api_key, api_secret);

const getRedisKeys = (room_name) => ({
  INFO: `live:${room_name}:info`,
  VIEWERS: `live:${room_name}:viewers`,
  PEAK_VIEW: `live:${room_name}:peak`,
  AVG_RATE: `live:${room_name}:avg_rate`,
  STAY_MINUTE: `live:${room_name}:stay`,
  ALL_VISITORS: `live:${room_name}:all_visitors`,
  REVISIT: `live:${room_name}:revisit`,
  CATEGORY: `live:${room_name}:category`,
  TIMESERIES: `live:${room_name}:timeseries`,
  VIEWER_RANK: `live:rank`,
});

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

  const keys = getRedisKeys(room_name);

  try {
    switch (event.event) {
      case "ingress_started": {
        const live_started_at = Date.now();
        await redis_client.hSetNX(
          keys.INFO,
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
        await redis_client.hSet(keys.INFO, "today", `${date}/${day_of_week}`);

        // 카테고리 저장
        const category = event.room?.metadata?.category || "기타";
        await redis_client.set(keys.CATEGORY, category);

        // 랭킹보드 초기화
        await redis_client.zAdd(keys.VIEWER_RANK, {
          score: 0,
          value: room_name,
        });

        // 시계열 초기 데이터
        await redis_client.zAdd(keys.TIMESERIES, {
          score: Date.now(),
          value: "0",
        });

        // 5분마다 시계열 데이터 저장
        startTimeseriesRecording(room_name);

        break;
      }

      case "participant_joined": {
        if (!viewer) break;

        //유저의 해당 방송 접속에 대한 중복 체크, 및 멀티탭 중복 체크
        const viewerVisitCount = await redis_client.hIncrBy(
          keys.VIEWERS,
          viewer,
          1,
        );

        //처음입장인 경우
        if (viewerVisitCount === 1) {
          const currentViewers = await redis_client.hLen(keys.VIEWERS);
          const peakViewersStr = await redis_client.hGet(
            keys.PEAK_VIEW,
            "peak_view",
          );
          //현재 방송 중인 총시청자수 순위에 해당 방송 시청자수 +1
          await redis_client.zIncrBy(keys.VIEWER_RANK, 1, room_name);
          const peakViewers = peakViewersStr ? parseInt(peakViewersStr, 10) : 0;

          if (currentViewers > peakViewers) {
            await redis_client.hSet(
              keys.PEAK_VIEW,
              "peak_view",
              currentViewers.toString(),
            );
          }

          //누적방문자수 (해당 방에 처음으로 접속할 때만 해당 로직을 실행)
          await redis_client.sAdd(keys.ALL_VISITORS, viewer);
        }
        //두번째 입장 혹은 같은 페이지의 탭이 2개이상 켜져 있는경우
        else if (viewerVisitCount >= 2) {
          //재방문 관련 로직은 아직 붎필요함으로 pass
        }

        // 시청 시작 시간 기록
        await redis_client.hSet(keys.AVG_RATE, viewer, Date.now().toString());

        break;
      }

      case "participant_left": {
        if (!viewer) break;

        const viewerLeftCount = await redis_client.hDel(keys.VIEWERS, viewer);

        if (viewerLeftCount > 0) {
          await redis_client.zIncrBy(keys.VIEWER_RANK, -1, room_name);

          const currentScore = await redis_client.zScore(
            keys.VIEWER_RANK,
            room_name,
          );
          if (currentScore < 0) {
            await redis_client.zAdd(keys.VIEWER_RANK, {
              score: 0,
              value: room_name,
            });
          }
        }

        // 시청 지속 시간 체크
        const joinTimeStr = await redis_client.hGet(keys.AVG_RATE, viewer);
        if (joinTimeStr) {
          const durationSec = Math.round(
            (Date.now() - parseInt(joinTimeStr, 10)) / 1000,
          );
          if (durationSec >= 60) {
            await redis_client.sAdd(keys.STAY_MINUTE, viewer);
          }
          await redis_client.hDel(keys.AVG_RATE, viewer);
        }

        break;
      }

      case "ingress_ended": {
        // 송출 종료 — 시계열 기록만 멈춤
        stopTimeseriesRecording(room_name);
        break;
      }

      case "room_finished": {
        //아주 낮은 확률로 서버가 터지거나, 유저가 해당 사인을 못받는 경우
        // ingreses_ended -> room_finished 정상적으로 이행되지 않을 수 있어서 room_finished에도 interval을 제거하는 로직을 만듬
        console.log("room_finished 이벤트 수신:", room_name);
        stopTimeseriesRecording(room_name);

        // 최대 시청자 수
        const peakViewersStr = await redis_client.hGet(
          keys.PEAK_VIEW,
          "peak_view",
        );
        const peakViewers = peakViewersStr ? parseInt(peakViewersStr, 10) : 0;

        // 방송 시작 시간
        const startedAtStr = await redis_client.hGet(keys.INFO, "started_at");
        const startISO = startedAtStr
          ? new Date(parseInt(startedAtStr, 10)).toISOString()
          : new Date().toISOString();

        // 누적 방문자 수
        const totalVisitors = await redis_client.sCard(keys.ALL_VISITORS);

        // 시청 지속률 (1분 이상 머문 사람 / 전체 방문자)
        const stayedViewers = await redis_client.sCard(keys.STAY_MINUTE);
        const retentionRate =
          totalVisitors > 0 ? (stayedViewers / totalVisitors).toFixed(2) : "0";

        const category = await redis_client.get(keys.CATEGORY);
        const dateInfo = await redis_client.hGet(keys.INFO, "today");
        const durationMin = startedAtStr
          ? Math.round((Date.now() - parseInt(startedAtStr, 10)) / 60000)
          : 0;

        // 랭킹보드에서 제거

        // 통계 API 호출
        const saveSuccess = await postLiveStats({
          room_name,
          peakViewers,
          startISO,
          totalVisitors,
          stayedViewers,
          retentionRate,
          category,
          durationMin,
        });
        if (saveSuccess) {
          const exists = await redis_client.exists(keys.INFO);
          console.log("INFO 키 존재 여부:", exists);
          await redis_client.zRem(keys.VIEWER_RANK, room_name);

          const keysToDelete = [
            keys.VIEWERS,
            keys.PEAK_VIEW,
            keys.INFO,
            keys.AVG_RATE,
            keys.STAY_MINUTE,
            keys.ALL_VISITORS,
            keys.CATEGORY,
            keys.TIMESERIES,
          ];

          for (const key of keysToDelete) {
            const result = await redis_client.del(key);
            console.log(`${key} 삭제: ${result}`);
          }
        } else {
          // 실패하면 Redis 데이터 유지 + 나중에 재시도할 수 있도록 표시
          await redis_client.hSet(keys.INFO, "save_failed", "true");
          console.error("Supabase 저장 실패 — Redis 데이터 유지");
        }

        // 리소스 정리

        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};

// 시계열 데이터 기록
const timeseriesIntervals = new Map();

const startTimeseriesRecording = (room_name) => {
  if (timeseriesIntervals.has(room_name)) return;
  const viewersKey = `live:${room_name}:viewers`;
  const timeseriesKey = `live:${room_name}:timeseries`;

  const intervalId = setInterval(
    async () => {
      try {
        const currentViewers = await redis_client.hLen(viewersKey);
        const timestamp = Date.now();

        await redis_client.zAdd(timeseriesKey, {
          score: timestamp,
          value: currentViewers.toString(),
        });

        const tenMinutesAgo = timestamp - 10 * 60 * 1000;
        await redis_client.zRemRangeByScore(timeseriesKey, 0, tenMinutesAgo);

        console.log(
          `[Timeseries] ${room_name}: ${currentViewers}명 (${new Date(timestamp).toISOString()})`,
        );
      } catch (error) {
        console.error(`[Timeseries Error] ${room_name}:`, error);
      }
    },
    5 * 60 * 1000,
  );

  timeseriesIntervals.set(room_name, intervalId);
};

const stopTimeseriesRecording = (room_name) => {
  const intervalId = timeseriesIntervals.get(room_name);
  if (intervalId) {
    clearInterval(intervalId);
    timeseriesIntervals.delete(room_name);
    console.log(`[Timeseries] ${room_name} 기록 중지`);
  }
};

// ViewerGrowth 계산
export const getViewerGrowth = async (room_name) => {
  const timeseriesKey = `live:${room_name}:timeseries`;
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  const recentData = await redis_client.zRangeByScoreWithScores(
    timeseriesKey,
    fiveMinutesAgo,
    now,
  );

  if (recentData.length < 2) {
    return 0;
  }

  const oldestViewers = parseInt(recentData[0].value, 10);
  const newestViewers = parseInt(recentData[recentData.length - 1].value, 10);

  if (oldestViewers === 0) {
    return newestViewers > 0 ? 1 : 0;
  }

  const growth = (newestViewers - oldestViewers) / oldestViewers;
  return Math.max(0, Math.min(1, growth));
};

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
