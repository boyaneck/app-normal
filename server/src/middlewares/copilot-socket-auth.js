import jwt from "jsonwebtoken";

export const authenticate = (socket) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.user = { id: decoded.userId, role: decoded.role };
  } catch (error) {
    console.log("웹 소켓 authenticate 중 오류 발생");
  }
};
