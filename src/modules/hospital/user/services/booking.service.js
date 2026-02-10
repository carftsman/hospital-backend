// src/modules/hospital/user/services/booking.service.js
import * as repo from "../repositories/booking.repository.js";

import prisma from "../../../../prisma/client.js";

export async function bookTimeslot({ userId, timeslotId }) {
  return prisma.$transaction(async tx => {

    const slot = await tx.timeSlot.findFirst({
      where: {
        id: timeslotId,
        isActive: true
      },
      include: {
        Booking: true
      }
    });

    if (!slot) {
      throw new Error("TIMESLOT_NOT_FOUND");
    }

    if (
      slot.Booking &&
      slot.Booking.status !== "EXPIRED" &&
      slot.Booking.expiresAt &&
      slot.Booking.expiresAt > new Date()
    ) {
      throw new Error("TIMESLOT_ALREADY_BOOKED");
    }

    // create booking
    const booking = await tx.booking.create({
      data: {
        userId,
        doctorId: slot.doctorId,
        timeslotId: slot.id,
        start: slot.start,
        end: slot.end,
        status: "CONFIRMED"
      },
      include: {
        user: true,
        timeSlot: {
          include: {
            doctor: {
              include: {
                hospital: true
              }
            }
          }
        }
      }
    });

    return booking;
  });
}
