"use strict";

// eslint-disable-next-line import/no-extraneous-dependencies
const { v4: uuidv4 } = require("uuid");
const Book = require("../models/bookModel");
const BorrowHistory = require("../models/borrowHistoryModel");

//#region 1. Get books
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
    if (req.query.catergory) {
      query.catergory = req.query.catergory;
    }
    const book = await Book.find(query);
    if (book.length === 0) {
      return res.status(404).send("Book not found");
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region 2. Borrow books
exports.borrowBooks = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const filter = { bookId, isAvailable: true };
    const update = { isAvailable: false };

    const newbook = await Book.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (!newbook || newbook.isAvailable) {
      throw new Error("book has been borrowed");
    }

    const borrowRecord = await BorrowHistory.create({
      userId,
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

//#region 3. Return books
exports.returnBooks = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const filter = { bookId, isAvailable: false };
    const update = { isAvailable: true };

    const newbook = await Book.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (!newbook || !newbook.isAvailable) {
      throw new Error("book has been returned");
    }

    const historyFilter = { userId, bookId, returnDate: { $exists: false } };
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

//#region 4. add new book
exports.addBooks = async (req, res) => {
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

//#region 5. Create a book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      throw new Error("ID 不存在！");
    } else {
      res.status(200).json({
        status: "success",
        data: {
          book,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
//#endregion

//#region 6. Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.body.bookId);
    if (!book) {
      throw new Error("ID 不存在！");
    } else {
      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
//#endregion
