"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Book = require("../models/bookModel");
const BorrowHistory = require("../models/borrowHistoryModel");

//#region Register
exports.register = async (req, res) => {
  try {
    // 创建新用户
    await User.create(req.body);

    res.status(201).send();
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errMsg: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({ errMsg: "UserID already exists" });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region Login
exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;
    let user;
    let isAdmin = false;

    if (userId.startsWith("A")) {
      user = await Admin.findOne({ adminId: userId });
      isAdmin = true;
    } else {
      user = await User.findOne({ userId });
    }

    // 根据用户名查找用户
    if (!user) {
      throw new Error("User not found");
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("password not match");
    }

    // 生成JWT（JSON Web Token）
    const token = jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, isAdmin });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ errMsg: error });
    }
    if (error.massage === "password not match") {
      return res.status(400).json({ errMsg: error });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion

//#region Get borrowed books
exports.borrowed = async (req, res) => {
  try {
    const { userId } = req;
    const filter = { userId, returnDate: { $exists: false } };

    const borrowedRecord = await BorrowHistory.find(filter); // array

    if (borrowedRecord.length === 0) {
      throw new Error("No borrowed books");
    }

    const borrowedBookId = borrowedRecord.map((record) => record.bookId);
    const bookFilter = { bookId: { $in: borrowedBookId } };

    const books = await Book.find(bookFilter); // array

    const respone = books.map((book, index) => ({
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      borrowRecord: borrowedRecord[index],
    }));
    res.status(200).json(respone);
  } catch (error) {
    if (error.message === "No borrowed books") {
      return res.status(404).json({ errMsg: error.message });
    }
    res.status(500).json({ errMsg: error.message });
  }
};
//#endregion
