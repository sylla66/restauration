const { Server } = require("socket.io");

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connecté: ${socket.id}`);

    socket.on("join-order", (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on("leave-order", (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client déconnecté: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io pas encore initialisé");
  }
  return io;
}

module.exports = { initSocket, getIO };
