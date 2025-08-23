export const chatSocket = (socket, namespace_room) => {
  socket.on("send_message", ({ message_info }) => {
    console.log("메세지 정보 확인하기", message_info);
    socket.emit("receive_message", message_info);
  });
};
