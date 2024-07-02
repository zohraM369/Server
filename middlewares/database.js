const mongoose = require("mongoose");

module.exports.checkConnexion = function (req, res, next) {
  if (mongoose.connection.readyState === 1) {
    req.log.info("verification de la connection de la base , OK");
    // 1 signifie connecté
    next(); // La connexion est établie, passer au middleware suivant
  } else {
    // 2 signifie connexion en cours
    req.log.info("verification de la connection de la base , NOK");
    res.statusCode = 500;
    res.send({
      msg: `La base de donnée est en erreur ${mongoose.connection.readyState}`,
      type_error: "eroor-connection-db",
    });
  }
};
