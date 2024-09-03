const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddlewares = require("../middlewares/authMiddlewares");

router.post("/register", async (req, res) => {
  try {
    const userexist = await User.findOne({ email: req.body.email });
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
      res
        .status(200)
        .send({ message: "Usuario Logeado", success: true, data: token });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error al Logear el Usuario", success: false, error });
  }
});

router.post("get-user-info-by-id", authMiddlewares, async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res
        .status(200)
        .send({ message: "Usuario no encontrado", success: false });
    } else {
      res
        .status(200)
        .send({
          message: "Usuario Encontrado",
          success: true,
          data: { name: user.name, email: user.email },
        });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error al obtener el Usuario", success: false, error });
  }
});

module.exports = router;
