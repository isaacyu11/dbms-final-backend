"use strict";

const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const userController = require("../controllers/userController");

const router = express.Router();

router.route("/register").post(userController.register);
router.route("/login").post(userController.login);
router.route("/borrowed").get(verifyToken.verifyToken, userController.borrowed);

module.exports = router;
