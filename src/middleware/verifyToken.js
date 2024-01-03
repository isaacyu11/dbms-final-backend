"use strict";

const jwt = require("jsonwebtoken");

exports.verifyUser = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send("A token is required for authentication");
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(403).send("Token is not provided in the correct format");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).send("Invalid token");
  }
};

exports.verifyAdmin = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send("A token is required for authentication");
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(403).send("Token is not provided in the correct format");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).send("Access denied");
    }

    req.adminId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).send("Invalid token");
  }
};
