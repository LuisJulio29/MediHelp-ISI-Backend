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
    const users = await User.find({isDoctor: false, isAdmin: false});
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

router.post("/change-doctor-status", authMiddlewares, async (req, res) => {
    try {
      const { doctorId, status } = req.body;
      const doctor = await Doctor.findByIdAndUpdate(doctorId, { status });
        const user = await User.findOne({ _id: doctor.userId });
        const unseenNotifications = user.unseenNotifications;
        unseenNotifications.push(
          {
            type:"new-doctor-state-request",
            message: `Su estado de doctor ha sido actualizado a ${status}`,
            onclick: "/#",
          })
        user.isDoctor = status === "approved" ? true : false;
        await user.save();

        res.status(200).send({
            message: "Estado del Doctor Actualizado Correctamente",
            success: true, 
            data: doctor});
        
    } catch (error) {
      console.log(error);
      res.status(500).send({
          message: "Error al Actualizar el Estado del Doctor", 
          success: false, 
          error });
    }
  });

  
router.delete("/delete-user/:id", authMiddlewares, async (req, res) => {
    try {
      const { id } = req.params;
      await User.findByIdAndDelete(id);
      res.status(200).send({
        message: "Usuario eliminado correctamente",
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error al eliminar el usuario",
        success: false,
        error,
      });
    }
  });
  

module.exports = router;