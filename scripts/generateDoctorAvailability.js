import { generateDoctorAvailabilityNext14Days } from
  "../src/modules/hospital/admin/services/doctorAvailability.generator.js";

await generateDoctorAvailabilityNext14Days();
process.exit(0);
