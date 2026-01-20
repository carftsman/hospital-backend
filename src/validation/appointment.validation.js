const { z } = require("zod");

exports.createAppointmentSchema = z.object({
  patientId: z.number().int().positive(),
  doctorId: z.number().int().positive(),
  dateTime: z.string().datetime(),
});
