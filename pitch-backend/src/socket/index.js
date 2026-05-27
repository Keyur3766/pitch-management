import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { EventEnum, Events } from "../utils/enums.js";


const initializeSocketIO = (io) => {
  io.on("connection", async (socket) => {
    try {
      const authToken = socket.handshake.auth?.token;

      if (!authToken) {
        throw new ApiError(401, "Unauthorized handshake. Token missing");
      }

      const decodedToken = jwt.verify(authToken, process.env.SECRET_KEY);

      const user = await prisma.user.findFirst({
        where: { id: decodedToken?.id },
      });
      
      if (!user) {
        throw new ApiError(401, "Unauthorized handshake. Token missing");
      }

      socket.user = user;

      
      socket.emit(EventEnum.CONNECTED_EVENT);

      console.log("User connected, userId: ", user.id.toString());
    //   mountJoinChatEvent(socket);
    //   mountTypingChatEvent(socket);
    //   mountStoppedTypingChatEvent(socket);

      socket.on(EventEnum.DISCONNECT_EVENT, () => {
        console.log("user has disconnected. userId: " + socket.user?.id);
        if (socket.user?.id) {
          socket.leave(socket.user.id);
        }
      });
    } catch (error) {
      socket.emit(
        "SocketError",
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  });
};

const emitSocketIOEvent = (req, event, payload) => {
  req.app.get("io").emit(event, payload);
};

export { initializeSocketIO, emitSocketIOEvent };
