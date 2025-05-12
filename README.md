# Node.js Simple CRUD API

To start the project, clone the repo, copy `.env.example` as `.env` file and run:

```bash
nvm use 22
npm i
npm run seed # To populate the 'database' with one user
npm run start:dev # To start in development mode
npm run start:prod # To start in production mode
npm run start:multi # To start in cluster mode
```

Open `http://localhost:3000` and send requests:

```
GET /api/users - to get all users
POST /api/users - to create a new user, payload: { username: String, age: Number, hobbies: Array }
GET /api/users/:id - to get a user by id
PUT /api/users/:id - to update a user by id, payload: { username: String, age: Number, hobbies: Array }
DELETE /api/users/:id - to delete a user by id
```

Note that 'database' isn't a real database and when you finish the proccess, the data will be lost. However, it is persistent between requests and different nodes in cluster mode.
