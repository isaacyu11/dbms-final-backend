"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = mongoose.Schema({
  adminId: {
    type: String,
    unique: true,
    required: [true, "admin id is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  name: {
    type: String,
    required: [true, "admin name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
});

adminSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt.hash(this.password, 10).then((hashedPassword) => {
    this.password = hashedPassword;
    next();
  });
});

adminSchema.set("toJSON", {
  virtuals: false,
  // eslint-disable-next-line no-unused-vars
  transform: function (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
