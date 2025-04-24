module.exports = (io) => {
  const chat_room = io.of("/chat");

  chat_room.on("connection", (socket) => {
    console.log("Connected to room namespace");

    socket.on("send_message", ({ message_info }) => {
      console.log("Message received", message_info);
      socket.emit("receive_message", message_info);
    });
  });
};
