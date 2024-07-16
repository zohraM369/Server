const express = require("express");
const ArticleController = require("../controllers/ArticleController");

// Déclaration des middlewares
const DatabaseMiddleware = require("../middlewares/database");
const router = express.Router();

// Création du endpoint /user pour l'ajout d'un utilisateur
router.post(
  "/article",
  DatabaseMiddleware.checkConnexion,
  ArticleController.addOneArticle
);

// Création du endpoint /user pour l'ajout de plusieurs utilisateurs
router.post(
  "/article",
  DatabaseMiddleware.checkConnexion,
  ArticleController.addManyArticles
);

// Création du endpoint /user pour la récupération d'un utilisateur par le champ selectionné
router.get(
  "/article",
  DatabaseMiddleware.checkConnexion,
  ArticleController.findOneArticle
);

// Création du endpoint /user pour la récupération d'un utilisateur via l'id
router.get(
  "/article/:id",
  DatabaseMiddleware.checkConnexion,
  ArticleController.findOneArticle
);

// Création du endpoint /user pour la récupération de plusieurs utilisateurs
router.get(
  "/articles_by_filter",
  DatabaseMiddleware.checkConnexion,
  ArticleController.findManyArticles
);

// Création du endpoint /user pour la récupération de plusieurs utilisateurs via l'idS
router.get(
  "/articles",
  DatabaseMiddleware.checkConnexion,
  ArticleController.findManyArticles
);

// Création du endpoint /user pour la modification d'un utilisateur
router.put(
  "/article/:id",
  DatabaseMiddleware.checkConnexion,
  ArticleController.updateOneArticle
);

// Création du endpoint /user pour la modification de plusieurs utilisateurs
router.put(
  "/articles",
  DatabaseMiddleware.checkConnexion,
  ArticleController.updateManyArticles
);

// Création du endpoint /user pour la suppression d'un utilisateur
router.delete(
  "/article/:id",
  DatabaseMiddleware.checkConnexion,
  ArticleController.deleteOneArticle
);

// Création du endpoint /user pour la suppression de plusieurs utilisateurs
router.delete(
  "/articles",
  DatabaseMiddleware.checkConnexion,
  ArticleController.deleteManyArticles
);

module.exports = router;
