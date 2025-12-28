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
  // req.body가 Buffer 타입이므로, WebhookReceiver에 그대로 전달합니다.
  const event = await receiver.receive(req.body, req.get("Authorization"));
  res.status(200).send("잘받았음");
  if (!event) return;
  let room_name = null;

  if (event.event.startsWith("ingress_")) {
    room_name = event.ingressInfo?.roomName;
  } else {
    room_name = event.room?.name;
  }
  if (!room_name) {
    console.log(
      `[Webhook] ${event.event} 이벤트를 받았으나 room_name을 찾을 수 없었습니다.`
    );
    return;
  }

  const viewer = event.participant ? event.participant.identity : null;
  const LIVE_INFO_KEY = `LIVE_INFORMATION:${room_name}`;
  const LIVE_VIEWERS = `LIVE_VIEWERS:${room_name}`;
  const LIVE_PEAK_VIEW = `LIVE_PEAK_VIEW:${room_name}`;
  const LIVE_AVG_RATE = `LIVE_AVG_RATE:${room_name}`;
  const LIVE_STAY_MINUTE = `LIVE_STAY_MINUTE:${room_name}`;
  try {
    // get('Authorization') 대신 headers.authorization을 사용합니다.
    //최대 동시 시청자 수ㅇ
    // console.log("이벤트확인하기", event);
    // console.log("ingress_started인 경우 ", event.room.name);
    // console.log(
    //   "방송제목 테스트 ingress_ended 인경우",
    //   event.ingressInfo ? event.ingressInfo.roomName : null
    // );
    // if (!event.room) {
    //   console.log("방이 생성되지 않았습니다");
    //   return res.status(200).send("ingress_ended 잘 받았음");
    // }
    //가져와야 할 현재 라이브 목록 관련
    switch (event.event) {
      case "ingress_started": {
        const live_started_at = Date.now();
        await redis_client.hSetNX(
          LIVE_INFO_KEY,
          "started_at",
          live_started_at.toString()
        );
        const now = new Date();
        const kst_off_set = 9 * 60 * 60 * 1000;
        const kst_time = new Date(now.getTime() + kst_off_set);
        const date = kst_time.toISOString().split("T")[0];
        const day_of_week = kst_time.toLocaleDateString("ko-KR", {
          weekday: "long",
        });
        const today = `${date}/${day_of_week}`;
        await redis_client.hSet(LIVE_INFO_KEY, "today", today);
        await redis_client.sAdd(`live_list_now`, room_name);
      }
      case "participant_joined": {
        if (!viewer) break;
        await redis_client.sAdd(LIVE_VIEWERS, viewer);
        const current_viewers = await redis_client.sCard(LIVE_VIEWERS);

        // 최대 동시 시청자 수 갱신 로직 (간소화)
        const current_top_viewer_str = await redis_client.hGet(
          LIVE_PEAK_VIEW,
          "peak_view"
        );
        const chk_top_viewer = current_top_viewer_str
          ? parseInt(current_top_viewer_str, 10)
          : 0;

        if (current_viewers > chk_top_viewer) {
          await redis_client.hSet(
            LIVE_PEAK_VIEW,
            "peak_view",
            current_viewers.toString()
          );
        }
        // 시청 시작 시간 저장
        await redis_client.hSet(LIVE_AVG_RATE, viewer, Date.now().toString());
        break;
      }
      case "participant_left": {
        if (!viewer) break;
        const end_at = Date.now();
        const get_start_at = await redis_client.hGet(LIVE_AVG_RATE, viewer);

        if (get_start_at) {
          const duration = Math.round(
            (end_at - parseInt(get_start_at, 10)) / 1000
          );
          if (duration >= 60) {
            await redis_client.sAdd(LIVE_STAY_MINUTE, viewer);
          }
        }
        break;
      }
      case "ingress_ended": {
        try {
          const get_peak_viewer =
            (await redis_client.hGet(LIVE_PEAK_VIEW, "peak_view")) || "0";
          const get_live_started_at = await redis_client.hGet(
            LIVE_INFO_KEY,
            "started_at"
          );

          let live_start_format = new Date().toISOString();
          if (get_live_started_at) {
            live_start_format = new Date(
              parseInt(get_live_started_at, 10)
            ).toISOString();
          }

          // 라이브 목록에서 삭제 및 통계 전송
          await redis_client.sRem(`live_list_now`, room_name);
          await postLiveStats(
            parseInt(get_peak_viewer, 10),
            room_name,
            live_start_format
          );

          // 사용한 Redis 키 삭제 (필요 시)
          // await redis_client.del(LIVE_INFO_KEY, LIVE_VIEWERS, LIVE_PEAK_VIEW, LIVE_AVG_RATE, LIVE_STAY_MINUTE);

          console.log(`[Webhook] 방송 종료 처리 완료: ${room_name}`);
        } catch (error) {
          console.error(
            `❌ [ERROR] 방 종료 통계 처리 실패 (${room_name}):`,
            error
          );
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook 처리 중 치명적 실패:", error);
    if (!res.headersSent) {
      res.status(400).send("Bad request.");
    }
  }
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
