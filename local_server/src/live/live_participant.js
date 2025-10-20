import { WebhookReceiver } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";
import { postLiveStats } from "../api/live.js";
const api_key = process.env.LIVEKIT_API_KEY;
const api_secret = process.env.LIVEKIT_API_SECRET;
const receiver = new WebhookReceiver(api_key, api_secret);
export const liveParticipantWebhook = async (req, res) => {
  try {
    // req.body가 Buffer 타입이므로, WebhookReceiver에 그대로 전달합니다.
    // get('Authorization') 대신 headers.authorization을 사용합니다.

    //최대 동시 시청자 수
    // const event = receiver.receive(req.body, req.get("Authorization"));
    const event = receiver.receive(req.body, req.headers.authorization);
    console.log("아니 왜 ;;;;;", event.room.name);
    const room_name = event.room ? event.room.name : null;
    if (!room_name) {
      console.error("오류: room_name이 null입니다. 이벤트 유형을 확인하세요.");
      return res.status(200).send("No room name, ignored."); // null 처리 후 조기 종료
    }
    const parti = event.participant ? event.participant.identity : null;
    console.log("event 값 확인하기", event);
    console.log("event.room 의 값 확인하기", event.room);
    if (event.event === "participant_joined") {
      await redis_client.sAdd(`${room_name}:live`, parti);
      const current_parti = await redis_client.sCard(`${room_name}:live`);
      const now = new Date();
      const kst_off_set = 9 * 60 * 60 * 1000;
      const kst_time = new Date(now.getTime() + kst_off_set);
      const date = kst_time.toISOString().split("T")[0];

      const day_of_week = kst_time.toLocaleDateString("ko-KR", {
        weekday: "long",
      });
      const today = `${date}/${day_of_week}`;

      await redis_client.hSetNX(`${room_name}:today`, "today", today);
      //최대 동시 시청자수
      await redis_client.hSet(
        `${room_name}:peak_viewer`,
        "peak_viewer",
        current_parti
      );
      const current_top_parti = await redis_client.hGet(
        `${room_name}:peak_viewer`,
        "peak_viewer"
      );

      if (
        current_top_parti === "1" ||
        current_parti > parseInt(current_top_parti, 10)
      ) {
        await redis_client.hSet(
          `${room_name}:peak_viewer`,
          "peak_viewer",
          current_parti
        );
      }
      //최대 동시 시청자수

      //평균 시청 지속률
      const start_at = Date.now();
      await redis_client.hSet(`${room_name}:avg_viewer`, parti, start_at);
    } else if (event.event === "participant_left") {
      //평균 시청 지속률
      const end_at = Date.now();
      const get_start_at = await redis_client.hGet(
        `${room_name}:avg_viewer`,
        parti
      );

      //나중에 같은 유저가 여러번 같은방송에 들어왔을때, 해당 값을 어떻게 처리할지에 대해 생각하기
      //어떤때는 그냥 들어와서 보기만하는데 ,어떤때는 들어왔는데, 더 짧은시간이지만,채팅,후원을 할 수 있기에에
      if (get_start_at) {
        const minimum_duration = 60;

        const duration = Math.round((end_at - get_start_at) / 1000);
        if (duration >= minimum_duration) {
          await redis_client.sAdd(`${room_name}:duration_over_minute`, parti);
        }
        //시청 지속률
        // conn_keep_rate = await redis_client.scan(
        //   `${room_name}:${parti}:duration`
        // );
      }
    } else if (event.event === "room_finished") {
      //지속 유저들/전체 입장한 유저들 = 평균 지속률률
      // const all_parti = await redis_client.sMembers(`${room_name}:live`);
    } else if (event.event === "ingress_ended") {
      res.status(200).send("Webhook을 성공적으로 받았습니다.");
      const ingress_info_room_name = event.ingressInfo?.roomName;
      try {
        const get_all_viewer = await redis_client.sMembers(
          `${ingress_info_room_name}:live`
        );
        // const get_peak_viewer = await redis_client.hGet(
        //   `${ingress_info_room_name}:peak_viewer`,
        //   "peak_viewer"
        // );
        const get_viewer_duration = await redis_client.lRange(
          `${ingress_info_room_name}:duration`,
          0,
          -1
        );

        console.log("방이 끝났어요11111111111", room_name);
        const get_peak_viewer = await redis_client.sCard(
          `${room_name}:peak_viewer`
        );
        const get_fund = await redis_client.get(`${room_name}:donation_sum`);
        const get_turn_into_chat_rate = await redis_client.get(
          `${room_name}:chat_involved_rate`
        );

        console.log("방이 끝났어요222222222");
        console.log(
          "모든 데이터가 잘 가져와졌는지 확인하기 .. ",
          "get_peak_viewer",
          get_peak_viewer,
          "get_fund:",
          get_fund,
          "get_turn_into_chat_rate:",
          get_turn_into_chat_rate
        );
        await postLiveStats(
          get_peak_viewer,
          get_fund,
          get_turn_into_chat_rate,
          room_name
        );

        console.log("방이 끝났어요333333333333");
        return;
      } catch (error) {}
    } else if (event.event === "room_ended") {
      //supabase에 데이터 넣기
      //후원금액,최대시청자,평균시청자,채팅전환율
      // const get_avg_viewer=redis_client.
    }
    // ✅ 성공 응답을 보내야 합니다.
    res.status(200).send("Webhook processed successfully.");
  } catch (error) {
    // ✅ 에러 응답을 보내야 합니다.
    console.error("Webhook 처리 실패:", error);
    res.status(400).send("Bad request.");
  }
};
