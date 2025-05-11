const UserModel = require("../../models/user.model");

const seedUser = {
  username: "John Doe",
  age: 30,
  hobbies: ["reading", "coding", "hiking"]
};

const user = UserModel.create(seedUser);
console.log("Created user:", user);

