const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique : true },
    email: { type: String, required: true, unique : true },
    password: { type: String, required: true },
    isDoctor: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    seenNotifications: { type: Array, default: [] },
    unseenNotifications: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
