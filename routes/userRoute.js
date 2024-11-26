const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddlewares = require("../middlewares/authMiddlewares");
const Appointment = require("../models/appointmentModel");
const moment = require("moment");

router.post("/register", async (req, res) => {
  try {
    const userexist = await User.findOne({ email: req.body.email } && {code: req.body.code});
    if (userexist) {
      return res
        .status(200)
        .send({ message: "Usuario ya existente", success: false });
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new User(req.body);
    await newUser.save();
    res
      .status(200)
      .send({ message: "Usuario Registrado Correctamente", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error al Crear el Usuario", success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "Usuario no encontrado", success: false });
    }

    const ismatch = await bcrypt.compare(req.body.password, user.password);
    if (!ismatch) {
      return res
        .status(200)
        .send({ message: "Contraseña incorrecta", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Enviamos `isDoctor` y `name` en la respuesta
      res.status(200).send({
        message: "Usuario Logeado",
        success: true,
        data: { token, isDoctor: user.isDoctor, name: user.name },
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error al Logear el Usuario", success: false, error });
  }
});

router.post("/get-user-info-by-id", authMiddlewares, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "Usuario no encontrado", success: false });
    } else {
      res.status(200).send({
        message: "Usuario Encontrado",
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error al obtener el Usuario", success: false, error });
  }
});

router.post("/apply-doctor-account", authMiddlewares, async (req, res) => {
  try {
    const newDoctor = new Doctor({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await User.findOne({ isAdmin: true });

    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} ha aplicado para una cuenta de doctor`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
      },
      onclick: "/doctors",
    });
    await User.findByIdAndUpdate(adminUser._id, {
      unseenNotifications: unseenNotifications,
    });
    res.status(200).send({
      message: "Aplicación a la cuenta de doctor enviada",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error al aplicar a la cuenta de doctor",
      success: false,
      error,
    });
  }
});

router.post("/mark-all-notifications-as-seen",authMiddlewares,async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      const unseenNotifications = user.unseenNotifications;
      const seenNotifications = user.seenNotifications;
      seenNotifications.push(...unseenNotifications);
      user.unseenNotifications = [];
      user.seenNotifications = seenNotifications;
      const updatedUser = await user.save();
      updatedUser.password = undefined;
      res.status(200).send({
        message: "Notificaciones marcadas como vistas",
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error al marcar las notificaciones como vistas",
        success: false,
        error,
      });
    }
});

router.post("/delete-all-notifications", authMiddlewares, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    res.status(200).send({
      message: "Notificaciones Eliminadas correctamente",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error al eliminar las Notificaciones",
      success: false,
      error,
    });
  }
});

router.get("/get-all-approved-doctors", authMiddlewares, async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" });
    res.status(200).send({
      message: "Doctores Encotrados Satifactoriamente",
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error al Obtener los Doctores",
      success: false,
      error,
    });
  }
});

router.post("/book-appointment", authMiddlewares, async (req, res) => {
  try {
    req.body.status = "pending";
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    const user = await User.findOne({ _id: req.body.doctorInfo.userId });
    user.unseenNotifications.push({
      type: "new-appointment-request",
      message: `Nueva Cita de ${req.body.userInfo.name}`,
      onclick: "/doctor/appointments",
    });
    await user.save();
    res.status(200).send({
      message: "Cita Reservada Satifactoriamente",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error al Reservar la Cita",
      success: false,
      error,
    });
  }
});

router.post("/get-available-slots", authMiddlewares, async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    const doctor = await Doctor.findById(doctorId);
    const appointments = await Appointment.find({ doctorId, date });
    const takenSlots = appointments.map((appt) => appt.time);

    const startTime = moment(doctor.timings[0], "HH:mm");
    const endTime = moment(doctor.timings[1], "HH:mm");
    const lunchStart = moment("12:00", "HH:mm");
    const lunchEnd = moment("13:00", "HH:mm");

    const availableSlots = [];
    while (startTime.isBefore(endTime)) {
      const formattedTime = startTime.format("HH:mm");
      if (
        !takenSlots.includes(formattedTime) &&
        (startTime.isBefore(lunchStart) || startTime.isAfter(lunchEnd))
      ) {
        availableSlots.push(formattedTime);
      }
      startTime.add(1, "hour");
    }

    res.status(200).send({
      message: "Horarios disponibles obtenidos exitosamente",
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error al obtener horarios disponibles",
      success: false,
      error,
    });
  }
});

router.get("/get-appointments-by-user-id", authMiddlewares, async (req, res) => {
  try {
    const appointments = await Appointment.find({userId:req.body.userId});
    const approvedAppointments = appointments.filter(appointment => appointment.status === "approved");
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
      const user = await User.findOne({ _id: appointment.doctorInfo.userId });
      const unseenNotifications = user.unseenNotifications;
      unseenNotifications.push(
        {
          type:"appointment-status-change",
          message: `el usuario ${appointment.userInfo.name} ha cancelado la cita`,
          onclick: "/doctor/appointments",
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
