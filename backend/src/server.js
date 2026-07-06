const http = require("http");
const app = require("./app");
const { initSocket } = require("./config/socket");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  try {
    await prisma.$connect();
    console.log("Connecté à PostgreSQL");
  } catch (err) {
    console.error("Erreur de connexion à la base de données:", err.message);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Déconnecté de la base de données");
  process.exit(0);
});
