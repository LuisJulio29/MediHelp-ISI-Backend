const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type:String,
      required: true,
    },
    firstName: {
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
   },
   status:{
    type: String,
    default: "pending",
   },
  },
  {
    timestamps: true,
  }
);
const DoctorModel = mongoose.model("Doctor", doctorSchema);
module.exports = DoctorModel;
