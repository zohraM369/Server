const express = require("express");
const UserController = require("../controllers/UserController");

// Déclaration des middlewares
const DatabaseMiddleware = require("../middlewares/database");
const router = express.Router();

// Création du endpoint /user pour l'ajout d'un utilisateur
router.post(
  "/user",
  DatabaseMiddleware.checkConnexion,
  UserController.addOneUser
);

// Création du endpoint /user pour l'ajout de plusieurs utilisateurs
router.post(
  "/users",
  DatabaseMiddleware.checkConnexion,
  UserController.addManyUsers
);

// Création du endpoint /user pour la récupération d'un utilisateur par le champ selectionné
router.get(
  "/user",
  DatabaseMiddleware.checkConnexion,
  UserController.findOneUser
);

// Création du endpoint /user pour la récupération d'un utilisateur via l'id
router.get(
  "/user/:id",
  DatabaseMiddleware.checkConnexion,
  UserController.findOneUserById
);

// Création du endpoint /user pour la récupération de plusieurs utilisateurs
router.get(
  "/users_by_filter",
  DatabaseMiddleware.checkConnexion,
  UserController.findManyUsers
);

// Création du endpoint /user pour la récupération de plusieurs utilisateurs via l'idS
router.get(
  "/users",
  DatabaseMiddleware.checkConnexion,
  UserController.findManyUsersById
);

// Création du endpoint /user pour la modification d'un utilisateur
router.put(
  "/user/:id",
  DatabaseMiddleware.checkConnexion,
  UserController.updateOneUser
);

// Création du endpoint /user pour la modification de plusieurs utilisateurs
router.put(
  "/users",
  DatabaseMiddleware.checkConnexion,
  UserController.updateManyUsers
);

// Création du endpoint /user pour la suppression d'un utilisateur
router.delete(
  "/user/:id",
  DatabaseMiddleware.checkConnexion,
  UserController.deleteOneUser
);

// Création du endpoint /user pour la suppression de plusieurs utilisateurs
router.delete(
  "/users",
  DatabaseMiddleware.checkConnexion,
  UserController.deleteManyUsers
);

module.exports = router;
