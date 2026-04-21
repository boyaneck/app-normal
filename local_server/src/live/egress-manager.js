import {
  EgressClient,
  EncodedFileType,
  EncodingOptionsPreset,
} from "livekit-server-sdk";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL;

const egressClient = new EgressClient(livekitUrl, apiKey, apiSecret);

/**
 * 방송 시작 시 LiveKit Egress 녹화 시작
 * → Supabase Storage (S3 호환)에 MP4로 저장
 *
 * @param {string} roomName
 * @returns {{ egressId: string, fileName: string }}
 */
export const startRecording = async (roomName) => {
  const timestamp = Date.now();
  const fileName = `recordings/${roomName}/${timestamp}.mp4`;

  const egressInfo = await egressClient.startRoomCompositeEgress(
    roomName,
    {
      file: {
        fileType: EncodedFileType.MP4,
        fileName: fileName,
        s3: {
          accessKey: process.env.SUPABASE_S3_ACCESS_KEY,
          secret: process.env.SUPABASE_S3_SECRET_KEY,
          region: process.env.SUPABASE_S3_REGION || "ap-southeast-1",
          endpoint: process.env.SUPABASE_S3_ENDPOINT,
          bucket: process.env.SUPABASE_S3_BUCKET || "recordings",
          forcePathStyle: true,
        },
      },
    },
    {
      preset: EncodingOptionsPreset.H264_720P_30,
    },
  );

  console.log(
    `🎥녹화 시작: ${roomName} → ${fileName} (egressId:${egressInfo.egressId})`,
  );

  return {
    egressId: egressInfo.egressId,
    fileName,
  };
};

/**
 * 방송 종료 시 Egress 중지
 * → LiveKit이 나머지 데이터를 S3에 flush하고 업로드 완료
 *
 * @param {string} egressId
 */
export const stopRecording = async (egressId) => {
  if (!egressId) return;

  try {
    await egressClient.stopEgress(egressId);
    console.log(`녹화 중지: ${egressId}`);
  } catch (err) {
    // 이미 종료된 경우 무시
    console.warn(`stopEgress 실패 (이미 종료됐을 수 있음): ${err.message}`);
  }
};

/**
 * Egress 상태 폴링 — 파일이 완전히 업로드될 때까지 대기
 * EgressStatus.EGRESS_COMPLETE(3) 이 될 때까지 최대 maxWaitMs 대기
 *
 * @param {string} egressId
 * @param {number} maxWaitMs   기본 5분
 * @returns {boolean} 완료 여부
 */
export const waitForEgressComplete = async (
  egressId,
  maxWaitMs = 5 * 60 * 1000,
) => {
  const POLL_INTERVAL = 5000;
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    try {
      const [info] = await egressClient.listEgress({ egressId });
      // status: 0=EGRESS_STARTING, 1=EGRESS_ACTIVE, 2=EGRESS_ENDING, 3=EGRESS_COMPLETE, 4=EGRESS_FAILED
      if (info?.status === 3) {
        console.log(`업로드 완료: ${egressId}`);
        return true;
      }
      if (info?.status === 4) {
        console.error(`실패 상태: ${egressId}`);
        return false;
      }
    } catch (err) {
      console.warn(`상태 조회 실패: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }

  console.warn(`대기 시간 초과: ${egressId}`);
  return false;
};
