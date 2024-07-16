var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var UserService = require("./../services/UserService");
const ConfigFile = require("../config");

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
passport.use(
  "Login",
  new LocalStrategy({ passReqToCallback: true }, function (
    req,
    username,
    password,
    done
  ) {
    //creation du systeme de login avec comparaison des mot de passe
  })
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "MY_SECRET_KEY_HASH",
      passReqToCallback: true,
    },
    function (req, jwt_payload, done) {
      // dechifrer le token et lire les informations dedans. (_id) -> pour rechercher l'utilisateur

      UserService.findOneUserById(jwt_payload._id, null, function (err, value) {
        if (err) done(err);
        else done(null, value);
      });
    }
  )
);

module.exports = passport;
