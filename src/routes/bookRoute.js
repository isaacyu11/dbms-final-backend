"use strict";

const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const bookController = require("../controllers/bookController");

const router = express.Router();

router.use(verifyToken.verifyUser);

router.route("/").get(bookController.getBooks);
router.route("/borrow").patch(bookController.borrowBooks);
router.route("/return").patch(bookController.returnBooks);

module.exports = router;
