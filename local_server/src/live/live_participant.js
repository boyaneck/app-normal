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
    const event = receiver.receive(req.body, req.get("Authorization"));
    const room_name = event.room ? event.room.name : null;
    const parti = event.participant ? event.participant.identity : null;
    if (event.event === "participant_joined") {
      console.log("????????????");
      await redis_client.sAdd(`${room_name}:live`, parti);
      const current_parti = await redis_client.sCard(`${room_name}:live`);

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

      console.log(
        "먼데 이건",
        current_parti,
        "currenttopparti",
        current_top_parti
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
        const duration = Math.round((end_at - get_start_at) / 1000);
        await redis_client.rPush(
          `${room_name}:duration`,
          `${parti}:${duration}`
        );
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
        console.log("이벤트 안됨 ?", ingress_info_room_name);
        const get_peak_viewer = await redis_client.hGet(
          `${ingress_info_room_name}:peak_viewer`,
          "peak_viewer"
        );
        console.log("이벤트 안되냐?222", ingress_info_room_name);
        const get_viewer_duration = await redis_client.lRange(
          `${ingress_info_room_name}:duration`,
          0,
          -1
        );
        console.log(
          "왜 숫자가 안나오는거지 ?",
          typeof get_all_viewer,
          typeof get_peak_viewer,
          typeof get_viewer_duration
        );
        await postLiveStats(
          get_all_viewer,
          get_peak_viewer,
          get_viewer_duration,
          ingress_info_room_name
        );

        return;
      } catch (error) {}
    }
    // ✅ 성공 응답을 보내야 합니다.
    res.status(200).send("Webhook processed successfully.");
  } catch (error) {
    // ✅ 에러 응답을 보내야 합니다.
    console.error("Webhook 처리 실패:", error);
    res.status(400).send("Bad request.");
  }
};
