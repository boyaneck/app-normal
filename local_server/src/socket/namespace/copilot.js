import { authroizeHost } from "../../middlewares/copilot-host-auth";
import { authenticate } from "../../middlewares/copilot-socket-auth";
import { copilotSocket } from "../copilot-socket";

export const copilotNamespace = (io) => {
  const copilotRoom = io.of("/copilot");

  copilotRoom.use(authenticate);
  copilotRoom.use(authroizeHost);

  console.log("auth/auth-host 인증 완료");

  copilotRoom.on("connection", (socket) => {
    console.log("copilot-socket 연결 완료! ✅");
    copilotSocket(socket, copilotRoom);
  });
};
