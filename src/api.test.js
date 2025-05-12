const http = require('http');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { server } = require('./index');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

const testUser = {
  username: 'Test User',
  age: 25,
  hobbies: ['testing', 'coding']
};

let createdUserId;

beforeAll(() => {
  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Test server started on port ${PORT}`);
      resolve();
    });
  });
});

afterAll(() => {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('Test server closed');
      resolve();
    });
  });
});

beforeEach(() => {
  db.users = [];
});


describe('CRUD API Tests', () => {
  test('GET /api/users should return an empty array initially', async () => {
    const response = await makeRequest('GET', '/api/users');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  test('POST /api/users should create a new user', async () => {
    const response = await makeRequest('POST', '/api/users', testUser);
    expect(response.statusCode).toBe(201);
    expect(response.body.username).toBe(testUser.username);
    expect(response.body.age).toBe(testUser.age);
    expect(response.body.hobbies).toEqual(testUser.hobbies);
    expect(response.body.id).toBeDefined();

    createdUserId = response.body.id;
  });

  test('GET /api/users/{userId} should return the created user', async () => {
    const createResponse = await makeRequest('POST', '/api/users', testUser);
    const userId = createResponse.body.id;
    const response = await makeRequest('GET', `/api/users/${userId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.username).toBe(testUser.username);
    expect(response.body.age).toBe(testUser.age);
    expect(response.body.hobbies).toEqual(testUser.hobbies);
  });

  test('PUT /api/users/{userId} should update the user', async () => {
    const createResponse = await makeRequest('POST', '/api/users', testUser);
    const userId = createResponse.body.id;

    const updatedUser = {
      username: 'Updated User',
      age: 30,
      hobbies: ['testing', 'coding', 'debugging']
    };

    const response = await makeRequest('PUT', `/api/users/${userId}`, updatedUser);
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.username).toBe(updatedUser.username);
    expect(response.body.age).toBe(updatedUser.age);
    expect(response.body.hobbies).toEqual(updatedUser.hobbies);
  });

  test('DELETE /api/users/{userId} should delete the user', async () => {
    const createResponse = await makeRequest('POST', '/api/users', testUser);
    const userId = createResponse.body.id;

    const response = await makeRequest('DELETE', `/api/users/${userId}`);
    expect(response.statusCode).toBe(204);
    expect(response.body).toBeNull();
  });

  test('GET /api/users/{userId} should return 404 for deleted user', async () => {
    const createResponse = await makeRequest('POST', '/api/users', testUser);
    const userId = createResponse.body.id;

    await makeRequest('DELETE', `/api/users/${userId}`);

    const response = await makeRequest('GET', `/api/users/${userId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  test('GET /api/users/{userId} should return 400 for invalid UUID', async () => {
    const response = await makeRequest('GET', '/api/users/invalid-uuid');
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('User ID is invalid (not uuid)');
  });

  test('GET /non-existent-route should return 404', async () => {
    const response = await makeRequest('GET', '/non-existent-route');

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Route not found');
  });
});

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData ? JSON.parse(responseData) : null
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}
