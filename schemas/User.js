const { first } = require("lodash");
const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,

    index: true,
  },
  email: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  phone: String,
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
});

module.exports = UserSchema;
