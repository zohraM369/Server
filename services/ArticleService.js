const _ = require("lodash");
const async = require("async");
const mongoose = require("mongoose");
const ArticleSchema = require("../schemas/Article");
const ObjectId = mongoose.Types.ObjectId;

var Article = mongoose.model("Article", ArticleSchema);

Article.createIndexes();

module.exports.addOneArticle = async function (article, options, callback) {
  try {
    var new_article = new Article(article);
    var errors = new_article.validateSync();
    //console.log(errors);
    if (errors) {
      errors = errors["errors"];
      var text = Object.keys(errors)
        .map((e) => {
          return errors[e]["properties"]["message"];
        })
        .join(" ");
      var fields = _.transform(
        Object.keys(errors),
        function (result, value) {
          result[value] = errors[value]["properties"]["message"];
        },
        {}
      );
      var err = {
        msg: text,
        fields_with_error: Object.keys(errors),
        fields: fields,
        type_error: "validator",
      };
      callback(err);
    } else {
      await new_article.save();
      callback(null, new_article.toObject());
    }
  } catch (error) {
    if (error.code === 11000) {
      // Erreur de duplicité
      var field = Object.keys(error.keyValue)[0];
      var err = {
        msg: `Duplicate key error: ${field} must be unique.`,
        fields_with_error: [field],
        fields: { [field]: `The ${field} is already taken.` },
        type_error: "duplicate",
      };
      callback(err);
    } else {
      callback(error); // Autres erreurs
    }
  }
};

module.exports.addManyArticles = async function (articles, options, callback) {
  var errors = [];

  // Vérifier les erreurs de validation
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    var new_article = new Article(article);
    var error = new_article.validateSync();
    if (error) {
      error = error["errors"];
      var text = Object.keys(error)
        .map((e) => {
          return error[e]["properties"]["message"];
        })
        .join(" ");
      var fields = _.transform(
        Object.keys(error),
        function (result, value) {
          result[value] = error[value]["properties"]["message"];
        },
        {}
      );
      errors.push({
        msg: text,
        fields_with_error: Object.keys(error),
        fields: fields,
        index: i,
        type_error: "validator",
      });
    }
  }
  if (errors.length > 0) {
    callback(errors);
  } else {
    try {
      // Tenter d'insérer les articles
      const data = await Article.insertMany(articles, { ordered: false });
      callback(null, data);
    } catch (error) {
      if (error.code === 11000) {
        // Erreur de duplicité
        const duplicateErrors = error.writeErrors.map((err) => {
          //const field = Object.keys(err.keyValue)[0];
          const field = err.err.errmsg
            .split(" dup key: { ")[1]
            .split(":")[0]
            .trim();
          return {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            fields: { [field]: `The ${field} is already taken.` },
            index: err.index,
            type_error: "duplicate",
          };
        });
        callback(duplicateErrors);
      } else {
        callback(error); // Autres erreurs
      }
    }
  }
};

module.exports.findManyArticles = function (q, page, limit, options, callback) {
  page = !page ? 1 : page;
  limit = !limit ? 1 : limit;
  var populate = options && options.populate ? ["user_id"] : [];

  page = !Number.isNaN(page) ? Number(page) : page;
  limit = !Number.isNaN(limit) ? Number(limit) : limit;
  const queryMongo = q
    ? {
        $or: _.map(["name", "description"], (e) => {
          return { [e]: { $regex: `^${q}`, $options: "i" } };
        }),
      }
    : {};
  if (Number.isNaN(page) || Number.isNaN(limit)) {
    callback({
      msg: `format de ${Number.isNaN(page) ? "page" : "limit"} est incorrect`,
      type_error: "no-valid",
    });
  } else {
    Article.countDocuments(queryMongo)
      .then((value) => {
        if (value > 0) {
          const skip = (page - 1) * limit;
          Article.find(queryMongo, null, {
            skip: skip,
            limit: limit,
            populate: populate,
            lean: true,
          }).then((results) => {
            callback(null, {
              count: value,
              results: results,
            });
          });
        } else {
          callback(null, { count: 0, results: [] });
        }
      })
      .catch((e) => {
        console.log(e);
        callback(e);
      });
  }
};

module.exports.findOneArticleById = function (article_id, options, callback) {
  var opts = { populate: options && options.populate ? ["user_id"] : [] };

  if (article_id && mongoose.isValidObjectId(article_id)) {
    Article.findById(article_id, null, opts)
      .then((value) => {
        try {
          if (value) {
            callback(null, value.toObject());
          } else {
            callback({
              msg: "Aucun articletrouvé.",
              type_error: "no-found",
            });
          }
        } catch (e) {}
      })
      .catch((err) => {
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
  } else {
    callback({ msg: "ObjectId non conforme.", type_error: "no-valid" });
  }
};

module.exports.findOneArticle = function (tab_field, value, options, callback) {
  var field_unique = ["name", "description"];
  var opts = {
    populate: options && options.populate ? ["user_id"] : [],
  };

  if (
    tab_field &&
    Array.isArray(tab_field) &&
    value &&
    _.filter(tab_field, (e) => {
      return field_unique.indexOf(e) == -1;
    }).length == 0
  ) {
    var obj_find = [];
    _.forEach(tab_field, (e) => {
      obj_find.push({ [e]: value });
    });
    Article.findOne({ $or: obj_find }, null, opts)
      .then((value) => {
        if (value) callback(null, value.toObject());
        else {
          callback({ msg: "article non trouvé.", type_error: "no-found" });
        }
      })
      .catch((err) => {
        callback({ msg: "Error interne mongo", type_error: "error-mongo" });
      });
  } else {
    let msg = "";
    if (!tab_field || !Array.isArray(tab_field)) {
      msg += "Les champs de recherche sont incorrecte.";
    }
    if (!value) {
      msg += msg
        ? " Et la valeur de recherche est vide"
        : "La valeur de recherche est vide";
    }
    if (
      _.filter(tab_field, (e) => {
        return field_unique.indexOf(e) == -1;
      }).length > 0
    ) {
      var field_not_authorized = _.filter(tab_field, (e) => {
        return field_unique.indexOf(e) == -1;
      });
      msg += msg
        ? ` Et (${field_not_authorized.join(
            ","
          )}) ne sont pas des champs de recherche autorisé.`
        : `Les champs (${field_not_authorized.join(
            ","
          )}) ne sont pas des champs de recherche autorisé.`;
      callback({
        msg: msg,
        type_error: "no-valid",
        field_not_authorized: field_not_authorized,
      });
    } else {
      callback({ msg: msg, type_error: "no-valid" });
    }
  }
};

module.exports.findManyArticlesById = function (
  articles_id,
  options,
  callback
) {
  var opts = {
    populate: options && options.populate ? ["user_id"] : [],
    lean: true,
  };

  if (
    articles_id &&
    Array.isArray(articles_id) &&
    articles_id.length > 0 &&
    articles_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == articles_id.length
  ) {
    articles_id = articles_id.map((e) => {
      return new ObjectId(e);
    });
    Article.find({ _id: articles_id }, null, opts)
      .then((value) => {
        try {
          if (value && Array.isArray(value) && value.length != 0) {
            callback(null, value);
          } else {
            callback({
              msg: "Aucun article trouvé.",
              type_error: "no-found",
            });
          }
        } catch (e) {
          console.log(e);
        }
      })
      .catch((err) => {
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
  } else if (
    articles_id &&
    Array.isArray(articles_id) &&
    articles_id.length > 0 &&
    articles_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != articles_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: articles_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (articles_id && !Array.isArray(articles_id)) {
    callback({
      msg: "L'argement n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};

module.exports.updateOneArticle = function (
  article_id,
  update,
  options,
  callback
) {
  if (article_id && mongoose.isValidObjectId(article_id)) {
    Article.findByIdAndUpdate(new ObjectId(article_id), update, {
      returnDocument: "after",
      runValidators: true,
    })
      .then((value) => {
        try {
          // callback(null, value.toObject())
          if (value) callback(null, value.toObject());
          else
            callback({
              msg: "article non trouvé.",
              type_error: "no-found",
            });
        } catch (e) {
          callback(e);
        }
      })
      .catch((errors) => {
        if (errors.code === 11000) {
          var field = Object.keys(errors.keyPattern)[0];
          const duplicateErrors = {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            fields: { [field]: `The ${field} is already taken.` },
            type_error: "duplicate",
          };
          callback(duplicateErrors);
        } else {
          errors = errors["errors"];
          var text = Object.keys(errors)
            .map((e) => {
              return errors[e]["properties"]["message"];
            })
            .join(" ");
          var fields = _.transform(
            Object.keys(errors),
            function (result, value) {
              result[value] = errors[value]["properties"]["message"];
            },
            {}
          );
          var err = {
            msg: text,
            fields_with_error: Object.keys(errors),
            fields: fields,
            type_error: "validator",
          };
          callback(err);
        }
      });
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.updateManyArticles = function (
  articles_id,
  update,
  options,
  callback
) {
  //
  if (
    articles_id &&
    Array.isArray(articles_id) &&
    articles_id.length > 0 &&
    articles_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == articles_id.length
  ) {
    articles_id = articles_id.map((e) => {
      return new ObjectId(e);
    });
    Article.updateMany({ _id: articles_id }, update, { runValidators: true })
      .then((value) => {
        try {
          //
          if (value && value.matchedCount != 0) {
            callback(null, value);
          } else {
            callback({
              msg: "Uarticles non trouvé",
              type_error: "no-found",
            });
          }
        } catch (e) {
          callback(e);
        }
      })
      .catch((errors) => {
        if (errors.code === 11000) {
          var field = Object.keys(errors.keyPattern)[0];
          const duplicateErrors = {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            index: errors.index,
            fields: { [field]: `The ${field} is already taken.` },
            type_error: "duplicate",
          };
          callback(duplicateErrors);
        } else {
          errors = errors["errors"];
          var text = Object.keys(errors)
            .map((e) => {
              return errors[e]["properties"]["message"];
            })
            .join(" ");
          var fields = _.transform(
            Object.keys(errors),
            function (result, value) {
              result[value] = errors[value]["properties"]["message"];
            },
            {}
          );
          var err = {
            msg: text,
            fields_with_error: Object.keys(errors),
            fields: fields,
            type_error: "validator",
          };
          callback(err);
        }
      });
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.deleteOneArticle = function (article_id, options, callback) {
  if (article_id && mongoose.isValidObjectId(article_id)) {
    Article.findByIdAndDelete(article_id)
      .then((value) => {
        try {
          if (value) callback(null, value.toObject());
          else
            callback({
              msg: "article non trouvé.",
              type_error: "no-found",
            });
        } catch (e) {
          callback(e);
        }
      })
      .catch((e) => {
        callback({
          msg: "Impossible de chercher l'élément.",
          type_error: "error-mongo",
        });
      });
  } else {
    callback({ msg: "Id invalide.", type_error: "no-valid" });
  }
};

module.exports.deleteManyArticles = function (articles_id, options, callback) {
  if (
    articles_id &&
    Array.isArray(articles_id) &&
    articles_id.length > 0 &&
    articles_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length == articles_id.length
  ) {
    articles_id = articles_id.map((e) => {
      return new ObjectId(e);
    });
    Article.deleteMany({ _id: articles_id })
      .then((value) => {
        callback(null, value);
      })
      .catch((err) => {
        callback({
          msg: "Erreur mongo suppression.",
          type_error: "error-mongo",
        });
      });
  } else if (
    articles_id &&
    Array.isArray(articles_id) &&
    articles_id.length > 0 &&
    articles_id.filter((e) => {
      return mongoose.isValidObjectId(e);
    }).length != articles_id.length
  ) {
    callback({
      msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.",
      type_error: "no-valid",
      fields: articles_id.filter((e) => {
        return !mongoose.isValidObjectId(e);
      }),
    });
  } else if (articles_id && !Array.isArray(articles_id)) {
    callback({
      msg: "L'argement n'est pas un tableau.",
      type_error: "no-valid",
    });
  } else {
    callback({ msg: "Tableau non conforme.", type_error: "no-valid" });
  }
};
