"use strict";

// eslint-disable-next-line import/no-extraneous-dependencies
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  bookId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: [true, "bookId is required"],
  },
  title: {
    type: String,
    required: [true, "book title is required"],
  },
  author: {
    type: String,
    required: [true, "book author  is required"],
  },
  language: {
    type: String,
    required: [true, "book language is required"],
  },
  category: {
    type: String,
    required: [true, "book catergory is required"],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

bookSchema.set("toJSON", {
  virtuals: false,
  // eslint-disable-next-line no-unused-vars
  transform: function (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
  },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
