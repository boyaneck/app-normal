import { RoomServiceClient } from "livekit-server-sdk";
import { finalizeLive } from "./finalize-live.js";
import { getLatestLiveStats } from "../api/live.js";

// RoomServiceClient는 http(s) 주소를 받는다 (wss로 적혀 있어도 동작하도록 변환)
const toHttpUrl = (url = "") => url.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");

const roomService = new RoomServiceClient(
  toHttpUrl(process.env.LIVEKIT_URL),
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET,
);

/**
 * POST /live/end  (requireUser 뒤에서 실행)
 * 호스트가 웹에서 "방송 종료"를 눌렀을 때
 *
 * 핵심: 어떤 방송을 끌지는 body가 아니라 "로그인 토큰의 user id"로 정한다.
 * body로 받으면 남의 방송도 끌 수 있기 때문 (브라우저는 믿을 수 없다).
 */
export const endLive = async (req, res) => {
  const roomName = req.user.id;

  try {
    const { result, stats } = await finalizeLive(roomName, { reason: "end_button" });

    // 방을 닫아서 시청자와 OBS(Ingress) 참가자를 내보낸다.
    // ⚠️ OBS는 "자동 재연결" 설정이 켜져 있으면 다시 붙을 수 있다 → 화면에서 OBS도 끄라고 안내함
    try {
      await roomService.deleteRoom(roomName);
    } catch (err) {
      // 이미 닫힌 방이면 실패해도 괜찮다
      console.log(`[EndLive] ${roomName} 방 삭제 생략:`, err.message);
    }

    if (result === "failed") {
      return res.status(500).json({ error: "통계 저장에 실패했습니다." });
    }

    // OBS를 먼저 꺼서 웹훅이 이미 정리했으면(skipped) 가장 최근 통계를 돌려준다
    const liveStats = stats ?? (await getLatestLiveStats(roomName));
    return res.json({ result, liveStatsId: liveStats?.id ?? null });
  } catch (error) {
    console.error(`[EndLive] ${roomName} 종료 처리 오류:`, error);
    return res.status(500).json({ error: "방송 종료 처리 중 오류가 발생했습니다." });
  }
};
