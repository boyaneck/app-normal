import { TokenVerifier } from "livekit-server-sdk";

const verifier = new TokenVerifier(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);

/**
 * 코파일럿 소켓 연결 시 호스트 검증
 *
 * 바뀐 점: 예전에는 토큰이 "어떤 방의 호스트"인지만 확인하고,
 * 실제로 들어갈 방 이름은 query.hostId(브라우저가 보낸 값)를 그대로 썼다.
 * → A 방의 호스트가 hostId만 바꾸면 B 방의 코파일럿을 엿볼 수 있었다.
 * 이제 방 이름은 서버가 서명을 검증한 토큰 안의 room 값으로만 정한다.
 */
export const authorizeHost = async (socket, next) => {
  try {
    const copilotToken = socket.handshake.auth?.token;
    if (!copilotToken) return next(new Error("Unauthorized!⚠️"));

    const claims = await verifier.verify(copilotToken);
    const identity = claims.sub;
    const room = claims.video?.room;

    if (!identity?.startsWith("HOST-") || !claims.video?.canPublish) {
      return next(new Error("Unidentified HOST:확인되지 않은 호스트 🚨"));
    }
    if (!room) return next(new Error("토큰에 방 정보가 없습니다."));

    const requestedHostId = socket.handshake.query?.hostId;
    if (requestedHostId && requestedHostId !== room) {
      return next(new Error("다른 방송의 코파일럿에는 접근할 수 없습니다."));
    }

    socket.data.roomName = room;
    next();
  } catch (error) {
    console.log("Copilot 호스트 인증 오류❌", error.message);
    next(new Error("Unauthorized: 인증되지 않음"));
  }
};
