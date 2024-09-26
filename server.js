const express = require('express');
const app = express();
require('dotenv').config();
const dbconfig = require('./config/dbconfig');
app.use(express.json());
const path = require('path');
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const doctorRoute = require('./routes/doctorRoute');



app.use("/api/user", userRoute); 
app.use("/api/admin", adminRoute);
app.use("/api/doctor", doctorRoute);
const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
