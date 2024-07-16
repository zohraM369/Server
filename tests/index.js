/* Connexion à la base de donnée */
require("../utils/database");
const mongoose = require("mongoose");

describe("UserService", () => {
  require("./services/UserService.test");
});

describe("UserController", () => {
  require("./controllers/UserController.test");
});

describe("ArticleService", () => {
  require("./services/ArticleService.test");
});

describe("ArticleController", () => {
  require("./controllers/ArticleController.test");
});

describe("API - Mongo", () => {
  it("Puger la db", () => {
    if (process.env.npm_lifecycle_event == "test")
      mongoose.connection.db.dropDatabase();
  });
});
