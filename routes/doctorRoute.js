const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorModel');
const authMiddlewares = require('../middlewares/authMiddlewares');
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');

router.post("/get-doctor-info-by-user-id",authMiddlewares, async (req,res) => {
    try {
      const doctor = await Doctor.findOne({userId: req.body.userId});
      res
        .status(200)
        .send({
          message: "Doctor Encontrado",
          success: true,
          data: doctor,
        }); 
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error al obtener la informacion del Doctor", success: false, error });
    }
  });

router.post("/get-doctor-info-by-id",authMiddlewares, async (req,res) => {
    try {
      const doctor = await Doctor.findOne({ _id: req.body.doctorId});
      res
        .status(200)
        .send({
          message: "Doctor Encontrado",
          success: true,
          data: doctor,
        }); 
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error al obtener la informacion del Doctor", success: false, error });
    }
  });

router.post("/update-doctor-profile",authMiddlewares, async (req,res) => {
    try {
      const doctor = await Doctor.findOneAndUpdate({userId: req.body.userId},
        req.body
      );
      res
        .status(200)
        .send({
          message: "Doctor Actualizado Satistactoriamente",
          success: true,
          data: doctor,
        }); 
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error al actualizar la informacion del  Doctor", success: false, error });
    }
  });

router.get("/get-appointments-by-doctor-id", authMiddlewares, async (req, res) => {
    try {
      const doctor = await Doctor.findOne({userId:req.body.userId});
      const appointments = await Appointment.find({doctorId: doctor._id});
      const approvedAppointments = appointments.filter(appointment => appointment.status === "approved" || appointment.status === "pending");
      res.status(200).send({
        message: "Citas Encotradas Satifactoriamente",
        success: true,
        data: approvedAppointments,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error al Obtener las Citas",
        success: false,
        error,
      });
    }
  });

router.post("/change-appointment-status", authMiddlewares, async (req, res) => {
    try {
      const { appointmentId, status } = req.body;
      const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status });
        const user = await User.findOne({ _id: appointment.userId });
        const unseenNotifications = user.unseenNotifications;
        unseenNotifications.push(
          {
            type:"appointment-status-change",
            message: `su estado de la cita ha sido actualizado a ${status}`,
            onclick: "/appointments",
          })
        await user.save();

        res.status(200).send({
            message: "Estado de la cita ha sido Actualizado Correctamente",
            success: true, });
        
    } catch (error) {
      console.log(error);
      res.status(500).send({
          message: "Error al Actualizar el Estado de la Cita", 
          success: false, 
          error });
    }
  });

  module.exports = router;