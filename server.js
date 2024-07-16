// 1ere chose à faire, importer les librairies
const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const Config = require("./config");
const Logger = require("./utils/logger").pino;

// Création de notre application express.js
const app = express();

// Démarrage de la database
require("./utils/database");

// ajout de module de login
const passport = require("./utils/passport");
/*  passport init  */
app.use(passport.initialize());
// app.use(passort.session())

// Déclaration des controllers pour l'utilisateur
const UserController = require("./controllers/UserController");

// Déclaration des middlewares
const DatabaseMiddleware = require("./middlewares/database");
const LoggerMiddleware = require("./middlewares/logger");

// Déclaration des middlewares à express
app.use(bodyParser.json(), LoggerMiddleware.addLogger);

/*--------------------- Création des routes (User - Utilisateur) ---------------------*/

// création du endpoint /login pour connecter un utilisateur
app.post("/login", DatabaseMiddleware.checkConnexion, UserController.loginUser);

// Création du endpoint /user pour l'ajout d'un utilisateur
app.post("/user", DatabaseMiddleware.checkConnexion, UserController.addOneUser);

// Création du endpoint /user pour l'ajout de plusieurs utilisateurs
app.post(
  "/users",
  DatabaseMiddleware.checkConnexion,
  UserController.addManyUsers
);

// Création du endpoint /user pour la récupération d'un utilisateur par le champ selectionné
app.get("/user", DatabaseMiddleware.checkConnexion, UserController.findOneUser);

// Création du endpoint /user pour la récupération d'un utilisateur via l'id
app.get(
  "/user/:id",
  DatabaseMiddleware.checkConnexion,
  UserController.findOneUserById
);

// Création du endpoint /user pour la récupération de plusieurs utilisateurs
app.get(
  "/users_by_filter",
  DatabaseMiddleware.checkConnexion,
  UserController.findManyUsers
);

// Création du endpoint /user pour la récupération de plusieurs utilisateurs via l'idS
app.get(
  "/users",
  DatabaseMiddleware.checkConnexion,
  UserController.findManyUsersById
);

// Création du endpoint /user pour la modification d'un utilisateur
app.put(
  "/user/:id",
  DatabaseMiddleware.checkConnexion,
  UserController.updateOneUser
);

// Création du endpoint /user pour la modification de plusieurs utilisateurs
app.put(
  "/users",
  DatabaseMiddleware.checkConnexion,
  UserController.updateManyUsers
);

// Création du endpoint /user pour la suppression d'un utilisateur
app.delete(
  "/user/:id",
  DatabaseMiddleware.checkConnexion,
  UserController.deleteOneUser
);

// Création du endpoint /user pour la suppression de plusieurs utilisateurs
app.delete(
  "/users",
  DatabaseMiddleware.checkConnexion,
  UserController.deleteManyUsers
);

/*--------------------- Création des routes (article ) ---------------------*/

// Déclaration des controllers pour l'utilisateur
const ArticleController = require("./controllers/ArticleController");

// Création du endpoint /article pour l'ajout d'un utilisateur
app.post(
  "/article",
  DatabaseMiddleware.checkConnexion,
  ArticleController.addOneArticle
);

// Création du endpoint /article pour l'ajout de plusieurs utilisateurs
app.post(
  "/articles",
  DatabaseMiddleware.checkConnexion,
  ArticleController.addManyArticles
);

// Création du endpoint /article pour la récupération d'un utilisateur par le champ selectionné
app.get(
  "/article",
  DatabaseMiddleware.checkConnexion,
  ArticleController.findOneArticle
);

// Création du endpoint /article pour la récupération d'un utilisateur via l'id
app.get(
  "/article/:id",
  DatabaseMiddleware.checkConnexion,
  ArticleController.findOneArticleById
);

// Création du endpoint /article pour la récupération de plusieurs utilisateurs
app.get(
  "/articles_by_filter",
  DatabaseMiddleware.checkConnexion,
  ArticleController.findManyArticles
);

// Création du endpoint /article pour la récupération de plusieurs utilisateurs via l'idS
app.get(
  "/articles",
  DatabaseMiddleware.checkConnexion,
  ArticleController.findManyArticlesById
);

// Création du endpoint /article pour la modification d'un utilisateur
app.put(
  "/article/:id",
  DatabaseMiddleware.checkConnexion,
  ArticleController.updateOneArticle
);

// Création du endpoint /article pour la modification de plusieurs utilisateurs
app.put(
  "/articles",
  DatabaseMiddleware.checkConnexion,
  ArticleController.updateManyArticles
);

// Création du endpoint /article pour la suppression d'un utilisateur
app.delete(
  "/article/:id",
  DatabaseMiddleware.checkConnexion,
  ArticleController.deleteOneArticle
);

// Création du endpoint /article pour la suppression de plusieurs utilisateurs
app.delete(
  "/articles",
  DatabaseMiddleware.checkConnexion,
  ArticleController.deleteManyArticles
);

// 2e chose à faire : Créer le server avec app.listen
app.listen(Config.port, () => {
  Logger.info(`Serveur démarré sur le port ${Config.port}.`);
});

module.exports = app;
