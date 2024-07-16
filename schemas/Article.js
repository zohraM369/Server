const { reflect } = require("async");
const { first } = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const ArticleSchema = mongoose.Schema({
  user_id: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now(),

    required: true,
  },
});

module.exports = ArticleSchema;
