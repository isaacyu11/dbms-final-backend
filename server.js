"use strict";

const mongoose = require("mongoose");
// eslint-disable-next-line import/no-extraneous-dependencies
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });
const app = require("./app");

console.log(process.env.NODE_ENV);
const DB = process.env.DATABASE;

(async () => {
  await mongoose
    .connect(DB)
    .then(() => {
      console.log("DB connection successful!");
    })
    .catch((err) => {
      console.log(err);
    });
})();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
