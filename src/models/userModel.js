"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: [true, "user id is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  name: {
    type: String,
    required: [true, "user name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt.hash(this.password, 10).then((hashedPassword) => {
    this.password = hashedPassword;
    next();
  });
});

userSchema.set("toJSON", {
  virtuals: false,
  // eslint-disable-next-line no-unused-vars
  transform: function (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
