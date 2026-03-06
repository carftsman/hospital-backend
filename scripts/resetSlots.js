import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function reset() {

  await prisma.booking.deleteMany({});
  await prisma.timeSlot.deleteMany({});
  await prisma.doctorAvailability.deleteMany({});

  console.log("Slots and bookings cleared");

}

reset();