"use strict";

// eslint-disable-next-line import/no-extraneous-dependencies
const { v4: uuidv4 } = require("uuid");
const Book = require("../models/bookModel");
const User = require("../models/userModel");
const BorrowHistory = require("../models/borrowHistoryModel");

//#region Add new book
exports.addBook = async (req, res) => {
  try {
    const bookId = uuidv4();
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const newBook = await Book.create({ bookId, ...req.body });

    res.status(200).json({ newBook });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region Update a book
exports.updateBook = async (req, res) => {
  try {
    const updateObj = {};
    Object.keys(req.body).forEach((key) => {
      if (!req.body[key] || key !== "id") {
        updateObj[key] = req.body[key];
      }
    });

    if (Object.keys(updateObj).length === 0) {
      return res.status(400).json({ errMsg: "No valid fields to update" });
    }

    const book = await Book.findByIdAndUpdate(req.body.id, updateObj, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      throw new Error("Book not found");
    }

    res.status(200).json({ book });
  } catch (error) {
    if (error === "No valid fields to update") {
      return res.status(400).json({ errMsg: error.message });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ errMsg: error.message });
    }
    if (error === "Book not found") {
      return res.status(404).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.body.bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    res.status(204).send();
  } catch (error) {
    if (error === "Book not found") {
      return res.status(404).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region Get users
exports.getUsers = async (req, res) => {
  try {
    const query = {};
    if (req.query.userId) {
      query.userId = req.query.userId;
    }
    if (req.query.name) {
      query.name = req.query.name;
    }
    const users = await User.find(query);
    if (users.length === 0) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(users);
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.body.userId);
    if (!user) {
      throw new Error("User not found");
    }

    res.status(204).send();
  } catch (error) {
    if (error === "User not found") {
      return res.status(404).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region Get borrow history
exports.getBorrowHistory = async (req, res) => {
  try {
    const query = {};
    if (req.query.userId) {
      query.userId = req.query.userId;
    }
    if (req.query.bookId) {
      query.bookId = req.query.bookId;
    }
    const borrowHistory = await BorrowHistory.find(query);
    if (borrowHistory.length === 0) {
      throw new Error("Borrow history not found");
    }
    res.status(200).json(borrowHistory);
  } catch (error) {
    if (error.message === "Borrow history not found") {
      return res.status(404).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion
