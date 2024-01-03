"use strict";

const express = require("express");
const morgan = require("morgan");

const userRouter = require("./src/routes/userRoute");
const bookRouter = require("./src/routes/bookRoute");
const adminRouter = require("./src/routes/adminRoute");

const app = express();

// 1) MIDDLEWARES
app.use(morgan("dev"));
app.use(express.json()); // parse json data from request body

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// 2) ROUTES
app.use("/user", userRouter);
app.use("/book", bookRouter);
app.use("/admin", adminRouter);

module.exports = app;
