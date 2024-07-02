const mongoose = require("mongoose");
const Logger = require("./logger").pino;

mongoose.connection.on("connected", () =>
  Logger.info("connecté a la base de donné")
);

mongoose.connection.on("open", () =>
  Logger.info("connection a la base de donné")
);

mongoose.connection.on("disconnected", () =>
  Logger.error("deconnecté a la base de donné")
);

mongoose.connection.on("reconnected", () =>
  Logger.info("reconnection a la base de donné")
);

mongoose.connection.on("disconnecting", () =>
  Logger.error("deconnection a la base de donné")
);

mongoose.connection.on("close", () =>
  Logger.info("connection a la base de donné est fermé")
);

mongoose.connect(
  `mongodb://localhost:27017/${
    process.env.npm_lifecycle_event == "test"
      ? "CDA_SERVER_TRAINING "
      : "CDA_SERVER_PRODUCTION"
  }`
);
