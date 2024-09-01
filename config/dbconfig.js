const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL);

const connection = mongoose.connection;

connection.on("connected", () => {
    console.log("Mongodb connected to db");
});

connection.on("error", (err) => {
    console.log("Mongoose connection error: ", err);
});

module.exports = mongoose;