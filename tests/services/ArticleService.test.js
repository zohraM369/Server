const ArticleService = require("../../services/ArticleService");
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");
const UserService = require("../../services/UserService");

var id_article_valid = "";
var articles = [];
var tab_id_articles = [];
var tab_id_users = [];

let users = [
  {
    firstName: "détenteur d'article 1",
    lastName: "iencli",
    username: "oui1",
    email: "iencli1@gmail.com",
    password: "12345",
  },

  {
    firstName: "détenteur d'article 2",
    lastName: "iencli",
    username: "oui2",
    email: "iencli2@gmail.com",
    password: "12345",
  },

  {
    firstName: "détenteur d'article 3",
    lastName: "iencil",
    username: "oui3",
    email: "iencli3@gmail.com",
    password: "12345",
  },

  {
    firstName: "détenteur d'article 4",
    lastName: "iencli",
    username: "oui4",
    email: "iencli4@gmail.com",
    password: "12345",
  },
];

it("Création des utilisateurs fictif", (done) => {
  UserService.addManyUsers(users, null, function (err, value) {
    tab_id_users = _.map(value, "_id");
    done();
  });
});
function rdm_user(tab) {
  let rdm_id = tab[Math.floor(Math.random() * (tab.length - 1))];
  return rdm_id;
}

describe("addOneArticle", () => {
  it("Article  correct. - S", () => {
    var article = {
      name: "tv",
      description: "samsung",
      price: 1500,
      quantity: 20,
      user_id: rdm_user(tab_id_users),
    };
    ArticleService.addOneArticle(article, null, function (err, value) {
      expect(value).to.be.a("object");
      expect(value).to.haveOwnProperty("_id");
      expect(value).to.haveOwnProperty("user_id");
      id_article_valid = value._id;
      articles.push(value);
    });
  });
  it("Un article incorrect. (name) - E", () => {
    var article_no_valid = {
      description: "samsung",
      price: 1500,
      quantity: 20,
      user_id: rdm_user(tab_id_users),
    };
    ArticleService.addOneArticle(article_no_valid, null, function (err, value) {
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
      expect(err).to.haveOwnProperty("fields");
      expect(err["fields"]).to.haveOwnProperty("name");
      expect(err["fields"]["tittle"]).to.equal("Path `tittle` is required.");
    });
  });
});

describe("addManyArticles", () => {
  it("Articles à ajouter, non valide. - E", (done) => {
    var articles_tab_error = [
      {
        name: "",
        description: "samsung",
        price: 2000,
        quantity: 30,
        user_id: rdm_user(tab_id_users),
      },

      {
        name: "chaise",
        description: "",
        price: 600,
        quantity: 20,
        user_id: rdm_user(tab_id_users),
      },
    ];

    ArticleService.addManyArticles(
      articles_tab_error,
      null,
      function (err, value) {
        done();
      }
    );
  });
  it("Articles à ajouter, valide. - S", (done) => {
    var articles_tab = [
      {
        name: "ordinateur",
        description: "samsung",
        price: 2000,
        quantity: 30,
        user_id: rdm_user(tab_id_users),
      },
      {
        name: "chaise",
        description: "en bois",
        price: 600,
        quantity: 20,
        user_id: rdm_user(tab_id_users),
      },
    ];

    ArticleService.addManyArticles(articles_tab, null, function (err, value) {
      console.log(err, value);
      tab_id_articles = _.map(value, "_id");
      articles = [...value, ...articles];
      expect(value).lengthOf(2);
      done();
    });
  });
});

describe("findOneArticle", () => {
  it("Chercher un article par les champs selectionnées. - S", (done) => {
    ArticleService.findOneArticle(
      ["name", "description"],
      articles[0].name,
      null,
      function (err, value) {
        expect(value).to.haveOwnProperty("name");
        done();
      }
    );
  });
  it("Chercher un article avec un champ non autorisé. - E", (done) => {
    ArticleService.findOneArticle(
      ["name", "dsecription"],
      articles[0].name,
      null,
      function (err, value) {
        expect(err).to.haveOwnProperty("type_error");
        done();
      }
    );
  });
  it("Chercher un article sans tableau de champ. - E", (done) => {
    ArticleService.findOneArticle(
      "name",
      articles[0].name,
      null,
      function (err, value) {
        expect(err).to.haveOwnProperty("type_error");
        done();
      }
    );
  });
  it("Chercher un article inexistant. - E", (done) => {
    ArticleService.findOneArticle(
      ["name"],
      articles[0].name,
      null,
      function (err, value) {
        expect(err).to.haveOwnProperty("type_error");
        done();
      }
    );
  });
});

describe("findManyArticles", () => {
  it("Retourne 3 articles - S", (done) => {
    ArticleService.findManyArticles(null, 1, 3, null, function (err, value) {
      expect(value).to.haveOwnProperty("count");
      expect(value).to.haveOwnProperty("results");
      expect(value["count"]).to.be.equal(3);
      expect(value["results"]).lengthOf(3);
      expect(err).to.be.null;
      done();
    });
  });

  it("Faire une recherche avec 0 resultats correspondant. - S", (done) => {
    ArticleService.findManyArticles(
      "couteau",
      1,
      3,
      null,
      function (err, value) {
        console.log(value);
        expect(value).to.haveOwnProperty("count");
        expect(value).to.haveOwnProperty("results");
        expect(value["count"]).to.be.equal(0);
        expect(value["results"]).lengthOf(0);
        expect(err).to.be.null;
        done();
      }
    );

    it("Envoie d'une chaine de caractère a la place de la page - E", (done) => {
      ArticleService.findManyArticles(
        null,
        "coucou",
        3,
        null,
        function (err, value) {
          expect(err).to.haveOwnProperty("type_error");
          expect(err["type_error"]).to.be.equal("no-valid");
          expect(value).to.undefined;
          done();
        }
      );
    });
  });
});

describe("findOneArticleById", () => {
  it("Chercher un article existant correct. - S", (done) => {
    ArticleService.findOneArticleById(
      id_article_valid,
      null,
      function (err, value) {
        expect(value).to.be.a("object");
        expect(value).to.haveOwnProperty("_id");
        expect(value).to.haveOwnProperty("name");
        done();
      }
    );
  });
  it("Chercher un article non-existant correct. - E", (done) => {
    ArticleService.findOneArticleById("100", null, function (err, value) {
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["type_error"]).to.equal("no-valid");
      done();
    });
  });
});

describe("findManyArticlessById", () => {
  it("Chercher des articles existant correct. - S", (done) => {
    ArticleService.findManyArticlesById(
      tab_id_articles,
      null,
      function (err, value) {
        expect(value).lengthOf(2);
        done();
      }
    );
  });
});

describe("updateOneArticle", () => {
  it("Modifier un article correct. - S", (done) => {
    ArticleService.updateOneArticle(
      id_article_valid,
      { name: "fenetre", description: "meuble" },
      null,
      function (err, value) {
        //console.log(value);
        expect(value).to.be.a("object");
        expect(value).to.haveOwnProperty("_id");
        expect(value).to.haveOwnProperty("name");
        expect(value).to.haveOwnProperty("description");
        expect(value["name"]).to.be.equal("fenetre");
        expect(value["description"]).to.be.equal("meuble");
        done();
      }
    );
  });
  it("Modifier un article avec id incorrect. - E", (done) => {
    ArticleService.updateOneArticle(
      "1200",
      { name: "ordi", description: "mac" },
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["type_error"]).to.be.equal("no-valid");
        done();
      }
    );
  });
  it("Modifier un article avec des champs requis vide. - E", (done) => {
    ArticleService.updateOneArticle(
      id_article_valid,
      { name: "", description: "meuble" },
      null,
      function (err, value) {
        expect(value).to.be.undefined;
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
        expect(err).to.haveOwnProperty("fields");
        expect(err["fields"]).to.haveOwnProperty("name");
        expect(err["fields"]["name"]).to.equal("Path `name` is required.");
        done();
      }
    );
  });
});

describe("updateManyArticles", () => {
  it("Modifier plusieurs articles correctement. - S", (done) => {
    ArticleService.updateManyArticles(
      tab_id_articles,
      { name: " chaise", description: "meuble" },
      null,
      function (err, value) {
        expect(value).to.haveOwnProperty("modifiedCount");
        expect(value).to.haveOwnProperty("matchedCount");
        expect(value["matchedCount"]).to.be.equal(tab_id_articles.length);
        expect(value["modifiedCount"]).to.be.equal(tab_id_articles.length);
        done();
      }
    );
  });
  it("Modifier plusieurs utilisateurs avec id incorrect. - E", (done) => {
    ArticleService.updateManyArticles(
      "1200",
      { name: " chaise", description: "meuble" },
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["type_error"]).to.be.equal("no-valid");
        done();
      }
    );
  });
  it("Modifier plusieurs articles avec des champs requis vide. - E", (done) => {
    ArticleService.updateManyArticles(
      tab_id_articles,
      { name: "", description: "meuble" },
      null,
      function (err, value) {
        expect(value).to.be.undefined;
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
        expect(err).to.haveOwnProperty("fields");
        expect(err["fields"]).to.haveOwnProperty("name");
        expect(err["fields"]["name"]).to.equal("Path `name` is required.");
        done();
      }
    );
  });
});

describe("deleteOneArticle", () => {
  it("Supprimer un article correct. - S", (done) => {
    ArticleService.deleteOneArticle(
      id_article_valid,
      null,
      function (err, value) {
        //callback
        expect(value).to.be.a("object");
        expect(value).to.haveOwnProperty("_id");
        expect(value).to.haveOwnProperty("name");
        expect(value).to.haveOwnProperty("description");
        done();
      }
    );
  });
  it("Supprimer un article avec id incorrect. - E", (done) => {
    ArticleService.deleteOneArticle("1200", null, function (err, value) {
      expect(err).to.be.a("object");
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["type_error"]).to.be.equal("no-valid");
      done();
    });
  });
  it("Supprimer un article avec un id inexistant. - E", (done) => {
    ArticleService.deleteOneArticle(
      "665f00c6f64f76ba59361e9f",
      null,
      function (err, value) {
        expect(err).to.be.a("object");
        expect(err).to.haveOwnProperty("msg");
        expect(err).to.haveOwnProperty("type_error");
        expect(err["type_error"]).to.be.equal("no-found");
        done();
      }
    );
  });
});

describe("deleteManyArticles", () => {
  it("Supprimer plusieurs articles correctement. - S", (done) => {
    ArticleService.deleteManyArticles(
      tab_id_articles,
      null,
      function (err, value) {
        expect(value).to.be.a("object");
        expect(value).to.haveOwnProperty("deletedCount");
        expect(value["deletedCount"]).is.equal(tab_id_articles.length);
        done();
      }
    );
  });
  it("Supprimer plusieurs articles avec id incorrect. - E", (done) => {
    ArticleService.deleteManyArticles("1200", null, function (err, value) {
      expect(err).to.be.a("object");
      expect(err).to.haveOwnProperty("msg");
      expect(err).to.haveOwnProperty("type_error");
      expect(err["type_error"]).to.be.equal("no-valid");
      done();
    });
  });
});

it("suppression des utilisateurs fictifs", (done) => {
  UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
    done();
  });
});
