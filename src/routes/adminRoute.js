"use strict";

const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.use(verifyToken.verifyAdmin);

router
  .route("/book")
  .post(adminController.addBook)
  .patch(adminController.updateBook)
  .delete(adminController.deleteBook);

router
  .route("/user")
  .get(adminController.getUsers)
  .delete(adminController.deleteUser);

router.route("/borrowHistory").get(adminController.getBorrowHistory);

module.exports = router;
