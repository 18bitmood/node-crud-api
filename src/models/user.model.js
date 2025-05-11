const { v4: uuidv4 } = require("uuid");
const db = require("../db");

class UserModel {
  static getAll() {
    return db.users;
  }

  static getById(id) {
    return db.users.find((user) => user.id === id) || null;
  }

  static create(userData) {
    const { username, age, hobbies = [] } = userData;

    this.validateUserFields({ username, age, hobbies });

    const newUser = {
      id: uuidv4(),
      username,
      age,
      hobbies,
    };

    db.users.push(newUser);
    return newUser;
  }

  static update(id, userData) {
    const userIndex = db.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    const { username, age, hobbies = [] } = userData;

    this.validateUserFields({ username, age, hobbies });

    const updatedUser = {
      id,
      username,
      age,
      hobbies,
    };

    db.users[userIndex] = updatedUser;
    return updatedUser;
  }

  static delete(id) {
    const userIndex = db.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return false;

    db.users.splice(userIndex, 1);
    return true;
  }

  static validateUserFields(userData) {
    const { username, age, hobbies } = userData;

    if (!username || typeof username !== "string") {
      throw new Error("Username is required and must be a string");
    }

    if (!age || typeof age !== "number") {
      throw new Error("Age is required and must be a number");
    }

    if (!Array.isArray(hobbies)) {
      throw new Error("Hobbies must be an array");
    }
  }
}

module.exports = UserModel;
