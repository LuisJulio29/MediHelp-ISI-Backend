const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fristName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
   timings:{
    type: Array,
    required: true,
   }
  },
  {
    timestamps: true,
  }
);
const DoctorModel = mongoose.model("Doctor", doctorSchema);
module.exports = DoctorModel;
