import { authorizeHost } from "../../middlewares/copilot-host-auth";
import { copilotSocket } from "../copilot-socket";

export const copilotNamespace = (io) => {
  const copilotRoom = io.of("/copilot");

  copilotRoom.use(authorizeHost);

  copilotRoom.on("connection", (socket) => {
    console.log(`copilot-socket 연결 완료 (host: ${socket.data.hostId}) ✅`);
    copilotSocket(socket, copilotRoom);
  });
};
