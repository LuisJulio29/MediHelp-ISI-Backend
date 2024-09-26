const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorModel');
const authMiddlewares = require('../middlewares/authMiddlewares');

router.post("/get-doctor-info-by-user-id",authMiddlewares, async (req,res) => {
    try {
      const doctor = await Doctor.findOne({_id: req.body.userId});
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

  module.exports = router;