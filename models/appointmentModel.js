const mongoose = require('mongoose');
const appointmentSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    doctorId:{
        type: String,
        required: true
    },
    doctorInfo:{
        type: Object,
        required: true
    },
    userInfo:{
        type: Object,
        required: true
    },
    date:{
        type: String,
        required: true
    },
    time:{
        type: String,
        required: true
    },
    status:{
        type: String,
        default: "approved"
    },
},
    { timestamps: true },
);

const appointmentModel = mongoose.model('Appointment', appointmentSchema);
module.exports = appointmentModel;