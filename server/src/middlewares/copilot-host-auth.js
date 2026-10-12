import { TokenVerifier } from "livekit-server-sdk";

const verifier = new TokenVerifier(
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET,
);

export const authorizeHost = async (socket, next) => {
  console.log("authorizeHost 로그 확인 ");
  try {
    console.log("try 문 입성");
    const copilotToken = socket.handshake.auth?.token;
    console.log("코파일럿토큰 확인", copilotToken);
    if (!copilotToken) return next(new Error("Unauthorized!⚠️"));
    const claims = await verifier.verify(copilotToken);
    console.log("해당 유저이 토큰 검증", claims);

    const identity = claims.sub;

    if (!identity?.startsWith("HOST-")) {
      console.log("해당 호스트가 해당 방송의 호스트가 아님 !!! ");
      return next(new Error("Unidentified HOST:확인되지 않은 호스트 🚨"));
    }

    console.log("제대로 된 호스트로 확인 되었음 authoirzeHost DONE ", identity);

    // 채팅/Redis roomName = URL id 파라미터 (UUID가 아닌 표시 이름)
    const hostId = socket.handshake.query?.hostId;
    if (!hostId) return next(new Error("hostId 없음"));

    socket.data.roomName = hostId;
    console.log("authorize Next 진행전");
    next();
    console.log("authorize Next 진행완료 후 생기는 콘솔 ");
  } catch (error) {
    console.log("Copilot 호스트 인증 오류❌", error.message);
    next(new Error("Unauthorized: 인증되지 않음"));
  }
};
