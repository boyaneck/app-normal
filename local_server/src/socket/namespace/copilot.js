import { authorizeHost } from "../../middlewares/copilot-host-auth.js";
import { copilotSocket } from "../copilot-socket.js";

export const copilotNamespace = (io) => {
  const copilotRoom = io.of("/copilot");
  copilotRoom.use(authorizeHost);
  copilotRoom.on("connection", (socket) => {
    console.log("authorizeHost 에서 next 실행후 , connection ");
    copilotSocket(socket, copilotRoom);
  });
};
