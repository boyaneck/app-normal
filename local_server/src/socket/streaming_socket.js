module.exports = (socket, namespace_room) => {
  socket.on("", ({ message_info }) => {
    console.log("메세지가 오고 있어요");
    socket.emit("receive_message", message_info);
  });
};
