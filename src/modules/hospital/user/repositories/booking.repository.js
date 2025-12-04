import prisma from "../../../../prisma/client.js";
import { Prisma } from "@prisma/client";

/**
 * Atomically book a timeslot.
 *
 * Behavior:
 *  - Validates timeslot exists and isActive.
 *  - Verifies slot isn't already booked.
 *  - Creates booking snapshot (booking.timeslotId is unique).
 *  - Marks the TimeSlot isActive = false (so it disappears from visible lists).
 *  - Creates a Notification row for the hospital (and stores user details).
 *
 * Concurrency:
 *  - If two requests race, one will succeed, the other will hit a unique constraint.
 *  - We catch that and throw a structured error with code "CONFLICT" so controller returns 409.
 */
export const createBookingTransactional = async (userId, timeslotId) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) load timeslot and related doctor+hospital
      const slot = await tx.timeSlot.findUnique({
        where: { id: timeslotId },
        include: {
          doctor: {
            include: { hospital: true },
          },
          booking: true, // will be non-null if already booked
        },
      });

      if (!slot) {
        const e = new Error("Timeslot not found");
        e.code = "SLOT_NOT_FOUND";
        throw e;
      }

      if (!slot.isActive) {
        const e = new Error("Timeslot inactive");
        e.code = "SLOT_INACTIVE";
        throw e;
      }

      if (slot.booking) {
        const e = new Error("Already booked");
        e.code = "ALREADY_BOOKED";
        throw e;
      }

      // 2) fetch user snapshot
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        const e = new Error("User not found");
        e.code = "USER_NOT_FOUND";
        throw e;
      }

      const doctor = slot.doctor;
      const hospital = doctor.hospital;

      // 3) create booking row (this references the timeslot via timeslotId unique constraint)
      // If another transaction created a booking for the same timeslot concurrently,
      // this create will fail with a unique-constraint error which we catch outside the tx.
      const booking = await tx.booking.create({
        data: {
          timeslotId,

          userId,

          // USER snapshot
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          userPhone: user.phone,

          // DOCTOR snapshot
          doctorId: doctor.id,
          doctorName: doctor.name,

          // HOSPITAL snapshot
          hospitalId: hospital.id,
          hospitalName: hospital.name,

          // time snapshot
          start: slot.start,
          end: slot.end,
        },
      });

      // 4) disable the timeslot so it becomes invisible in queries (isActive -> false)
      // Doing this after booking ensures the timeslot->booking relation exists and also makes it explicit
      await tx.timeSlot.update({
        where: { id: timeslotId },
        data: { isActive: false },
      });

      // 5) create notification (hospital side) - stores same snapshot data
      await tx.notification.create({
        data: {
          userId: user.id,
          hospitalId: hospital.id,
          bookingId: booking.id,

          doctorName: doctor.name,
          hospitalName: hospital.name,
          userName: `${user.firstName} ${user.lastName}`,
          userPhone: user.phone,

          slotStart: slot.start,
          slotEnd: slot.end,
        },
      });

      // include timeSlot (optional) before returning
      const created = await tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          timeSlot: true,
        },
      });

      return created;
    });

    return result;
  } catch (err) {
    // Prisma unique constraint on booking.timeslotId -> P2002
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const e = new Error("Timeslot already booked (unique constraint)");
      e.code = "CONFLICT";
      throw e;
    }

    // Re-throw structured errors thrown inside tx
    if (err?.code) throw err;

    // Unexpected error
    throw err;
  }
};
