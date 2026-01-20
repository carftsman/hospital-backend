const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

exports.createDoctor = async (req, res) => {
  const { name, specialization, phone, email, password } = req.body;

  const doctor = await prisma.doctor.create({
    data: {
      name,
      specialization,
      phone,
      email,
      password: await bcrypt.hash(password, 10),
      role: "DOCTOR",
    },
  });

  res.status(201).json(doctor);
};

exports.getDoctors = async (req, res) => {
  const doctors = await prisma.doctor.findMany({
    select: {
      id: true,
      name: true,
      specialization: true,
      phone: true,
      email: true,
    },
  });
  res.json(doctors);
};
