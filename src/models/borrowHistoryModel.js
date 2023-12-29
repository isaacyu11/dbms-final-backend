"use strict";

const mongoose = require("mongoose");

const borrowHistorySchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  bookId: {
    type: String,
    required: true,
  },
  borrowDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  returnDate: {
    type: Date,
  },
});

borrowHistorySchema.set("toJSON", {
  virtuals: false,
  // eslint-disable-next-line no-unused-vars
  transform: function (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
  },
});

const BorrowHistory = mongoose.model("BorrowHistory", borrowHistorySchema);

module.exports = BorrowHistory;
