const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const authMiddlewares = require("../middlewares/authMiddlewares");


router.get("/get-all-doctors", authMiddlewares, async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.status(200).send({ 
            message:"Doctores Encotrados Satifactoriamente",
            success: true, 
            data: doctors });
    } catch (error) {
        console.log(error);
        res.status(500).send({ 
            message: "Error al Obtener los Doctores",
            success: false, 
            error });
    }
    });

 
    
router.get("/get-all-users", authMiddlewares, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({ 
        message:"Usuarios Encotrados Satifactoriamente",
        success: true, 
        data: users });
  } catch (error) {
    console.log(error);
    res.status(500).send({
        message: "Error al Obtener los Usuarios", 
        success: false, 
        error });
  }
});

module.exports = router;