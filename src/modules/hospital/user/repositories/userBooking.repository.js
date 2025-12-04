import prisma from "../../../../prisma/client.js";

export const findBookingsForUser = (userId, skip, take) => {
  return prisma.booking.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    select: {
      id: true,
      status: true,
      start: true,
      end: true,
      createdAt: true,

      // doctor snapshot
      doctorId: true,
      doctorName: true,

      // hospital snapshot
      hospitalId: true,
      hospitalName: true,

      timeSlot: {
        select: {
          id: true,
          start: true,
          end: true,
          consultationMode: true
        }
      }
    }
  });
};

export const countBookingsForUser = (userId) => {
  return prisma.booking.count({
    where: { userId: Number(userId) }
  });
};

export const findBookingDetails = (userId, bookingId) => {
  return prisma.booking.findFirst({
    where: { id: bookingId, userId: Number(userId) },
    select: {
      id: true,
      status: true,
      createdAt: true,

      // snapshot doctor
      doctorId: true,
      doctorName: true,

      // snapshot hospital
      hospitalId: true,
      hospitalName: true,

      // snapshot slot
      start: true,
      end: true,

      // relation slot for additional info
      timeSlot: {
        select: {
          id: true,
          start: true,
          end: true,
          consultationMode: true,
          doctor: {
            select: {
              imageUrl: true,
              specialization: true,
              qualification: true,
              about: true
            }
          }
        }
      }
    }
  });
};
