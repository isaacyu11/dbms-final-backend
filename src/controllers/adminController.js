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
    const filter = { bookId: req.body.bookId };

    const book = await Book.findOne(filter);

    if (!book) {
      throw new Error("Book not found");
    }

    if (!book.isAvailable) {
      throw new Error("Book is not available for update");
    }

    Object.keys(req.body).forEach((key) => {
      if (!req.body[key] || key !== "bookId") {
        updateObj[key] = req.body[key];
      }
    });

    if (Object.keys(updateObj).length === 0) {
      throw new Error("No valid fields to update");
    }

    const newBook = await Book.findOneAndUpdate(filter, updateObj, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ newBook });
  } catch (error) {
    if (error.message === "No valid fields to update") {
      return res.status(400).json({ errMsg: error.message });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ errMsg: error.message });
    }
    if (error.message === "Book not found") {
      return res.status(404).json({ errMsg: error.message });
    }
    if (error.message === "Book is not available for update") {
      return res.status(400).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ bookId: req.body.bookId });

    if (!book) {
      throw new Error("Book not found");
    }

    if (!book.isAvailable) {
      throw new Error("Book is not available for deletion");
    }

    await Book.findOneAndDelete({ bookId: req.body.bookId });
    res.status(204).send();
  } catch (error) {
    if (error.message === "Book not found") {
      return res.status(404).json({ errMsg: error.message });
    }
    if (error.message === "Book is not available for deletion") {
      return res.status(400).json({ errMsg: error.message });
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
      throw new Error("User not found");
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
    const { userId } = req.body;
    const borrowHistory = await BorrowHistory.find({
      userId,
      returnDate: { $exists: false },
    });

    if (borrowHistory.length !== 0) {
      const borrowedBookId = borrowHistory.map((record) => record.bookId);
      const books = await Book.find(
        { bookId: { $in: borrowedBookId } },
        { title: 1, _id: 0 },
      );
      throw new Error(`User has borrowed books ${books}`);
    }

    const user = await User.findOneAndDelete({ userId });
    if (!user) {
      throw new Error("User not found");
    }

    res.status(204).send();
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ errMsg: error.message });
    }
    if (error.message.startsWith("User has borrowed books")) {
      return res.status(400).json({ errMsg: error.message });
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

    const borrowHistory = await BorrowHistory.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users", // 'users' 应该是 User 集合的集合名
          localField: "userId",
          foreignField: "_id", // 假设 User 集合使用 '_id' 作为主键
          as: "user",
        },
      },
      {
        $lookup: {
          from: "books", // 'books' 应该是 Book 集合的集合名
          localField: "bookId",
          foreignField: "_id", // 假设 Book 集合使用 '_id' 作为主键
          as: "book",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $unwind: "$book",
      },
      {
        $project: {
          name: "$user.name",
          title: "$book.title",
          borrowDate: 1,
          returnDate: 1,
        },
      },
    ]);
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
