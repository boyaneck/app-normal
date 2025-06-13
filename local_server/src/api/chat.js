// pages/api/moderate.ts
import { RoomServiceClient, RoomParticipant } from 'livekit-server-sdk';
import { ModerateRequestData, ParticipantChatMetadata } from '../../types'; // 타입 임포트


// --- 실제 구현 시 필요한 설정값들 ---
const LIVEKIT_HOST = process.env.LIVEKIT_HOST!;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;

// --- 유틸리티 함수 (실제로는 별도 파일로 분리) ---
const getLivekitClient = () => new RoomServiceClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
const authenticateStreamer = async (req, roomName): Promise<{ identity }> => {
 
  console.warn("TODO: Implement actual streamer authentication!");
  return { identity: "streamer-placeholder" };
};
const db = {
  ban: {
    upsert: async (options) => { console.log("DB Upsert (Ban):", options); return { id: 'mock-ban-id', ...options.create }; },
  }
};
// -----------------------------------------

export default async function handler(req,res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const roomService = getLivekitClient();
  const data = req.body ;

  try {
    // --- 1. 인증/인가 ---
    const streamer = await authenticateStreamer(req, data.roomName);
    if (!streamer) {
      return res.status(403).json({ message: 'Forbidden: Only the streamer can moderate.' });
    }

    // --- 2. 유효성 검사 (간단 예시) ---
    if (!data.action || !data.targetIdentity || !data.roomName) {
      return res.status(400).json({ message: 'Bad Request: Missing required fields.' });
    }

    const now = Date.now();
    let metadataUpdate: Partial<ParticipantChatMetadata> = {};
    let kickUser = false;
    let banRecordData = null; // DB에 저장할 데이터

    // --- 3. 제재 유형별 처리 ---
    switch (data.action) {
      case 'mute':
        const durationMs = (data.durationMinutes || 10) * 60 * 1000; // 기본 10분
        const expiresAt = now + durationMs;
        metadataUpdate = { isMuted: true, muteExpiresAt: expiresAt, canChat: false }; // 메타데이터 업데이트 준비

        console.log(`Attempting to mute ${data.targetIdentity} in ${data.roomName} until ${new Date(expiresAt).toISOString()}`);
        break;

      case 'kick':
        kickUser = true;
        const kickDurationMs = (data.durationMinutes || 10) * 60 * 1000; // 기본 10분 강퇴
        const kickExpiresAt = new Date(now + kickDurationMs);
        banRecordData = {
          where: { roomName_userIdentity: { roomName: data.roomName, userIdentity: data.targetIdentity } },
          update: { banType: 'kick', expiresAt: kickExpiresAt, bannedBy: streamer.identity, reason: data.reason },
          create: { roomName: data.roomName, userIdentity: data.targetIdentity, banType: 'kick', expiresAt: kickExpiresAt, bannedBy: streamer.identity, reason: data.reason },
        };
        console.log(`Attempting to kick ${data.targetIdentity} from ${data.roomName} for ${data.durationMinutes} minutes`);
        break;

      case 'ban':
        kickUser = true;
        banRecordData = {
           where: { roomName_userIdentity: { roomName: data.roomName, userIdentity: data.targetIdentity } },
           update: { banType: 'permanent', expiresAt: null, bannedBy: streamer.identity, reason: data.reason },
           create: { roomName: data.roomName, userIdentity: data.targetIdentity, banType: 'permanent', expiresAt: null, bannedBy: streamer.identity, reason: data.reason },
        };
        console.log(`Attempting to permanently ban ${data.targetIdentity} from ${data.roomName}`);
        break;

      default:
        return res.status(400).json({ message: 'Bad Request: Invalid action type.' });
    }

    // --- 4. LiveKit 액션 수행 ---
    if (Object.keys(metadataUpdate).length > 0) {
      // 메타데이터 업데이트 (Mute)
      await roomService.updateParticipant(
        data.roomName,
        data.targetIdentity,
        // 현재 메타데이터를 가져와서 병합하는 것이 더 안전할 수 있음 (여기서는 덮어쓰기 예시)
        { metadata: JSON.stringify(metadataUpdate) }
      );
      console.log(`Metadata updated for ${data.targetIdentity}`);
    }

    if (kickUser) {
      // 강퇴 (Kick/Ban)
      try {
        await roomService.removeParticipant(data.roomName, data.targetIdentity);
        console.log(`Participant ${data.targetIdentity} removed from ${data.roomName}`);
      } catch (error) {
        // 이미 나간 유저 등 에러 처리 (404 Not Found 등은 무시 가능)
        if (error.code !== 404) { // Livekit 에러 코드 확인 필요
           console.error("Error removing participant:", error);
           // throw error; // 심각한 경우 다시 던지기
        } else {
           console.log(`Participant ${data.targetIdentity} was likely already gone.`);
        }
      }
    }

    // --- 5. DB 업데이트 (Kick/Ban 정보 저장) ---
    if (banRecordData) {
      await db.ban.upsert(banRecordData); // Prisma 스타일 예시
      console.log(`Ban record saved to DB for ${data.targetIdentity}`);
    }

    // --- 6. 성공 응답 ---
    res.status(200).json({ success: true, message: `Action '${data.action}' applied to ${data.targetIdentity}.` });

  } catch (error) {
    console.error("Error processing moderation request:", error);
    // LiveKit 에러, DB 에러 등 상세 분기 필요
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}