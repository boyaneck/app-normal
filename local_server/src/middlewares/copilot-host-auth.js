import { TokenVerifier } from "livekit-server-sdk";

const verifier = new TokenVerifier(
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET,
);

export const authorizeHost = async (socket, next) => {
  try {
    const copilotToken = socket.handshake.auth?.token;
    if (!copilotToken) return next(new Error("Unauthorized!⚠️"));
    const claims = await verifier.verify(copilotToken);

    const identity = claims.sub;
    const roomName = identity.replace("HOST-", "");

    if (!identity?.startsWith("HOST")) {
      return next(new Error("Unidentified HOST:확인되지 않은 호스트 🚨"));
    }
    socket.data.roomName = roomName;
    next();
  } catch (error) {
    console.log("Copilot 호스트 인증 오류❌", error.message);
    next(new Error("Unauthorized: 인증되지 않음"));
  }
};
