const express = require("express");
const { RoomServiceClient } = require("livekit-server-sdk");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const LIVEKIT_HOST = process.env.LIVEKIT_HOST;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let roomService;
let supabase;

const getLivekitClient = () => {
  if (!roomService) {
    roomService = new RoomServiceClient(
      LIVEKIT_HOST,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    );
  }
  return roomService;
};

const getSupabaseAdminClient = () => {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      /* ... 옵션 */
    });
  }
  return supabase;
};

// --- 실제 인증 로직 (동일, Express의 req 객체 사용) ---
const authenticateStreamer = async (req, roomName) => {
  console.warn(
    "보안 경고: 실제 스트리머 인증 로직을 구현해야 합니다! (Express)"
  );
  return { identity: "streamer-placeholder-identity" };
};
// ----------------------------------------------------

router.post("/moderate", async (req, res) => {
  const roomServiceClient = getLivekitClient();
  const supabaseAdmin = getSupabaseAdminClient();
  const data = req.body; // 타입 정의는 TypeScript 사용 시 동일하게 적용 가능

  try {
    // --- 1. 인증 및 인가 ---
    const streamer = await authenticateStreamer(req, data.roomName);
    if (!streamer) {
      // Express 응답 방식
      return res
        .status(403)
        .json({
          message:
            "Forbidden: You do not have permission to perform this action.",
        });
    }

    // --- 2. 요청 데이터 유효성 검사 ---
    if (
      !data.action ||
      (data.action !== "kick" && data.action !== "ban") ||
      !data.targetIdentity ||
      !data.roomName
    ) {
      return res
        .status(400)
        .json({
          message:
            "Bad Request: Missing or invalid required fields (action, targetIdentity, roomName).",
        });
    }

    const now = new Date();
    let banRecordData = null;

    switch (data.action) {
      case "kick":
        const kickDurationMinutes =
          data.durationMinutes && data.durationMinutes > 0
            ? data.durationMinutes
            : 10;
        const kickExpiresAt = new Date(
          now.getTime() + kickDurationMinutes * 60 * 1000
        );
        banRecordData = {
          /* ... Supabase 데이터 ... */
        }; // 위 Next.js 코드와 동일
        console.log(`[Moderation] Attempting to kick ...`);
        break;
      case "ban":
        banRecordData = {
          /* ... Supabase 데이터 ... */
        }; // 위 Next.js 코드와 동일
        console.log(`[Moderation] Attempting to ban ...`);
        break;
    }

    // --- 4. LiveKit 참가자 강퇴 실행 ---
    try {
      await roomServiceClient.removeParticipant(
        data.roomName,
        data.targetIdentity
      );
      console.log(`[Moderation] Successfully removed participant ...`);
    } catch (livekitError) {
      // 위 Next.js 코드와 동일한 에러 처리 로직
      if (
        livekitError?.response?.status === 404 ||
        livekitError?.status === 404
      ) {
        console.log(`[Moderation] Participant already gone ...`);
      } else {
        console.error(
          `[Moderation] Error removing participant from LiveKit:`,
          livekitError
        );
        throw new Error(
          `Failed to remove participant from LiveKit: ${livekitError.message}`
        );
      }
    }

    // --- 5. Supabase에 밴/킥 기록 저장 ---
    if (banRecordData) {
      const { data: upsertData, error: supabaseError } = await supabaseAdmin
        .from("bans")
        .upsert(banRecordData, { onConflict: "room_name,user_identity" })
        .select()
        .single();

      if (supabaseError) {
        console.error(
          `[Moderation] Error saving ban record to Supabase:`,
          supabaseError
        );
        throw new Error(`Failed to save ban record: ${supabaseError.message}`);
      }
      console.log(`[Moderation] Successfully saved/updated ban record ...`);
    }

    // --- 6. 성공 응답 ---
    // Express 응답 방식
    return res
      .status(200)
      .json({
        success: true,
        message: `Action '${data.action}' successfully applied to ${data.targetIdentity}.`,
      });
  } catch (error) {
    console.error(
      "[Moderation] Unhandled error processing moderation request:",
      error
    );
    // Express 응답 방식
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router; // Express 라우터 모듈로 내보내기
