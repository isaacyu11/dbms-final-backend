"use strict";

const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const bookController = require("../controllers/bookController");

const router = express.Router();

router.route("/").get(verifyToken.verifyToken, bookController.getBooks);
router
  .route("/borrow")
  .patch(verifyToken.verifyToken, bookController.borrowBooks);
router
  .route("/return")
  .patch(verifyToken.verifyToken, bookController.returnBooks);
router.route("/add").post(bookController.addBooks);

module.exports = router;
