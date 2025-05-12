const http = require("http");
const dotenv = require("dotenv");
const UserModel = require("./models/user.model");
const { validate: validateUUID } = require("uuid");

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const url = req.url;
  const method = req.method;

  // GET all users
  if (url === "/api/users" && method === "GET") {
    handleGetAllUsers(req, res);
    return;
  }

  // GET user by ID
  if (url.match(/^\/api\/users\/(.+)$/) && method === "GET") {
    const userId = url.split("/")[3];
    handleGetUserById(req, res, userId);
    return;
  }

  // POST create new user
  if (url === "/api/users" && method === "POST") {
    handleCreateUser(req, res);
    return;
  }

  // PUT update user
  if (url.match(/^\/api\/users\/(.+)$/) && method === "PUT") {
    const userId = url.split("/")[3];
    handleUpdateUser(req, res, userId);
    return;
  }

  // DELETE user
  if (url.match(/^\/api\/users\/(.+)$/) && method === "DELETE") {
    const userId = url.split("/")[3];
    handleDeleteUser(req, res, userId);
    return;
  }

  // Default response for unmatched routes
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
});

// Only start the server if not being required by cluster.js
if (!module.parent) {
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
}

// Helpers

function renderInvalidUUID(res) {
  res.writeHead(400, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "User ID is invalid (not uuid)" }));
  return;
}

function renderUserNotFound(res) {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "User not found" }));
  return;
}

function renderInternalError(res, error) {
  res.writeHead(500, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Internal Server Error", error: error.message }));
  return;
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const parsedBody = JSON.parse(body);
        resolve(parsedBody);
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

function handleGetAllUsers(req, res) {
  try {
    const users = UserModel.getAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } catch (error) {
    renderInternalError(res, error);
  }
}

function handleGetUserById(req, res, userId) {
  try {
    if (!validateUUID(userId)) {
      return renderInvalidUUID(res);
    }

    const user = UserModel.getById(userId);

    if (!user) {
      return renderUserNotFound(res);
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(user));
  } catch (error) {
    renderInternalError(res, error);
  }
}

async function handleCreateUser(req, res) {
  try {
    const userData = await parseRequestBody(req);

    try {
      const newUser = UserModel.create(userData);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newUser));
    } catch (validationError) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: validationError.message }));
    }
  } catch (error) {
    renderInternalError(res, error);
  }
}

async function handleUpdateUser(req, res, userId) {
  try {
    if (!validateUUID(userId)) {
      return renderInvalidUUID(res);
    }

    const userData = await parseRequestBody(req);

    try {
      const updatedUser = UserModel.update(userId, userData);

      if (!updatedUser) {
        return renderUserNotFound(res);
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(updatedUser));
    } catch (validationError) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: validationError.message }));
    }
  } catch (error) {
    renderInternalError(res, error);
  }
}

function handleDeleteUser(req, res, userId) {
  try {
    const deleted = UserModel.delete(userId);

    if (!deleted) {
      return renderUserNotFound(res);
    }

    res.writeHead(204);
    res.end();
  } catch (error) {
    renderInternalError(res, error);
  }
}

module.exports = {
  server,
  start: (port) => {
    return new Promise((resolve) => {
      server.listen(port, () => {
        console.log(`Worker started on port ${port}`);
        resolve();
      });
    });
  }
};
