const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Server is running" }));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", () => {
  console.log("Server shutting down");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

module.exports = server;
