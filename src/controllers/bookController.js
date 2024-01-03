"use strict";

// eslint-disable-next-line import/no-extraneous-dependencies
const Book = require("../models/bookModel");
const BorrowHistory = require("../models/borrowHistoryModel");

//#region Get books
exports.getBooks = async (req, res) => {
  try {
    const query = {};
    if (req.query.title) {
      query.title = new RegExp(req.query.title, "i");
    }
    if (req.query.isAvailable) {
      query.isAvailable = req.query.isAvailable;
    }
    if (req.query.language) {
      query.language = req.query.language;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    const books = await Book.find(query);
    if (books.length === 0) {
      throw new Error("Book not found");
    }
    res.status(200).json(books);
  } catch (error) {
    if (error.message === "Book not found") {
      return res.status(404).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region Borrow books
exports.borrowBooks = async (req, res) => {
  try {
    const { bookId } = req.body;
    const filter = { bookId, isAvailable: true };
    const update = { isAvailable: false };

    const newbook = await Book.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (!newbook || newbook.isAvailable) {
      throw new Error("book has been borrowed");
    }

    const borrowRecord = await BorrowHistory.create({
      userId: req.userId,
      bookId,
      borrowDate: new Date(),
    });

    res.status(200).json({
      bookId: newbook.bookId,
      title: newbook.title,
      author: newbook.author,
      borrowRecord,
    });
  } catch (error) {
    if (error.message === "book has been borrowed") {
      return res.status(409).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region Return books
exports.returnBooks = async (req, res) => {
  try {
    const { bookId } = req.body;
    const filter = { bookId, isAvailable: false };
    const update = { isAvailable: true };

    const newbook = await Book.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (!newbook || !newbook.isAvailable) {
      throw new Error("book has been returned");
    }

    const historyFilter = {
      userId: req.userId,
      bookId,
      returnDate: { $exists: false },
    };
    const historyUpdate = { returnDate: new Date() };

    const borrowRecord = await BorrowHistory.findOneAndUpdate(
      historyFilter,
      historyUpdate,
      { new: true },
    );

    if (!borrowRecord || !borrowRecord.returnDate) {
      throw new Error("book has been returned");
    }

    res.status(200).json({
      bookId: newbook.bookId,
      title: newbook.title,
      author: newbook.author,
      borrowRecord,
    });
  } catch (error) {
    if (error.message === "book has been returned") {
      return res.status(409).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion
