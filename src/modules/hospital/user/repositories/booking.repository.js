// src/modules/hospital/user/repositories/booking.repository.js
import prisma from "../../../../prisma/client.js";

export const createBookingTransactional = async (userId, timeslotId) => {
  return prisma.$transaction(async (tx) => {
    const slot = await tx.timeSlot.findUnique({
      where: { id: Number(timeslotId) },
      include: {
        booking: true,
        doctor: {
          include: {
            hospital: true,
          },
        },
      },
    });

    if (!slot || !slot.isActive) {
      throw new Error("TIMESLOT_NOT_FOUND");
    }

    if (slot.booking) {
      throw new Error("TIMESLOT_ALREADY_BOOKED");
    }

    const booking = await tx.booking.create({
      data: {
        timeslotId: slot.id,
        userId,
        doctorId: slot.doctorId,
        start: slot.start,
        end: slot.end,
        status: "CONFIRMED",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        timeSlot: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                consultationFee: true,
                hospital: {
                  select: {
                    id: true,
                    name: true,
                    location: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return booking;
  });
};
