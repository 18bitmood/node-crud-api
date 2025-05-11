const http = require("http");
const dotenv = require("dotenv");
const UserModel = require("./models/user.model");

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  const url = req.url;
  const method = req.method;

  if (url === "/api/users" && method === "GET") {
    handleGetAllUsers(req, res);
    return;
  }

  // Default response for unmatched routes
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
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
  
  setTimeout(() => {
    console.log("Server shutdown timed out, forcing exit");
    process.exit(1);
  }, 3000);
});

function handleGetAllUsers(req, res) {
  try {
    const users = UserModel.getAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal Server Error", error: error.message }));
  }
  return;
}

module.exports = server;
