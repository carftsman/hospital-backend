// resetDb.js
import prisma from "./src/prisma/client.js";

async function resetDatabase() {
  try {
    console.log("\n🚀 Starting safe database reset...");

    await prisma.booking.deleteMany();
    console.log("✔ Booking cleared");

    await prisma.timeSlot.deleteMany();
    console.log("✔ TimeSlot cleared");

    await prisma.doctor.deleteMany();
    console.log("✔ Doctor cleared");

    await prisma.category.deleteMany();
    console.log("✔ Category cleared");

    await prisma.hospital.deleteMany();
    console.log("✔ Hospital cleared");

    await prisma.user.deleteMany();
    console.log("✔ User cleared");

    console.log("\n🎉 Database wiped successfully (Schema untouched!)\n");
  } catch (err) {
    console.error("\n❌ Error while resetting DB:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
