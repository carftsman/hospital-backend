import prisma from "../../../../prisma/client.js";

// ---- Doctor & Timeslot Fetching ----
export const findDoctorByIdAndHospital = (doctorId, hospitalId) => {
  return prisma.doctor.findFirst({
    where: { id: Number(doctorId), hospitalId: Number(hospitalId) },
    select: { id: true }
  });
};

export const findDoctorWithHospital = (doctorId) => {
  return prisma.doctor.findFirst({
    where: { id: Number(doctorId) },
    select: {
      id: true,
      hospitalId: true,
      hospital: {
        select: { id: true, consultationMode: true }
      }
    }
  });
};

// Fetch timeslot and minimal doctor info (avoid returning entire doctor entity)
export const findTimeslotByIdWithDoctor = (slotId) => {
  return prisma.timeSlot.findFirst({
    where: { id: Number(slotId) },
    select: {
      id: true,
      start: true,
      end: true,
      consultationMode: true,
      isActive: true,
      doctor: {
        select: { id: true, hospitalId: true }
      }
    }
  });
};

// ---- Overlap Check (coarse) ----
export const findOverlappingSlots = (doctorId, minStart, maxEnd) => {
  return prisma.timeSlot.findMany({
    where: {
      doctorId: Number(doctorId),
      AND: [
        { start: { lt: maxEnd } },
        { end: { gt: minStart } }
      ],
      isActive: true
    },
    select: { id: true, start: true, end: true }
  });
};

// ---- Create (transaction + re-check) ----
export const createManySlots = async (doctorId, slots) => {
  // use a transaction: re-check overlap inside TX and create slots
  return prisma.$transaction(async (tx) => {
    // 1) Re-check overlaps within the transaction to avoid race conditions.
    const minStart = new Date(Math.min(...slots.map(s => s.start.getTime())));
    const maxEnd = new Date(Math.max(...slots.map(s => s.end.getTime())));

    const existing = await tx.timeSlot.findMany({
      where: {
        doctorId: Number(doctorId),
        AND: [
          { start: { lt: maxEnd } },
          { end: { gt: minStart } }
        ],
        isActive: true
      },
      select: { id: true, start: true, end: true }
    });

    if (existing.length) {
      // return error shape expected by controller/service
      throw { status: 409, message: "Overlapping slots found", overlaps: existing };
    }

    // 2) Create slots sequentially (createMany doesn't return rows, so create in loop)
    const created = [];
    for (const s of slots) {
      const slot = await tx.timeSlot.create({
        data: {
          doctorId: Number(doctorId),
          start: s.start,
          end: s.end,
          consultationMode: s.consultationMode,
          isActive: true
        },
        select: {
          id: true,
          start: true,
          end: true,
          consultationMode: true,
          isActive: true,
          createdAt: true
        }
      });
      created.push(slot);
    }

    return created;
  });
};

// ---- List ----
export const listSlots = (doctorId, where, skip, take) => {
  return prisma.timeSlot.findMany({
    where: { doctorId: Number(doctorId), ...where },
    orderBy: { start: "asc" },
    skip,
    take,
    select: {
      id: true,
      start: true,
      end: true,
      consultationMode: true,
      isActive: true,
      createdAt: true,
      booking: {
        select: { id: true, status: true, createdAt: true }
      }
    }
  });
};

// ---- Booking Check ----
export const findBookingForSlot = (slotId) => {
  return prisma.booking.findUnique({
    where: { timeslotId: Number(slotId) },
    select: { id: true }
  });
};

// ---- Update ----
export const updateSlot = (slotId, data) => {
  return prisma.timeSlot.update({
    where: { id: Number(slotId) },
    data,
    select: {
      id: true,
      start: true,
      end: true,
      consultationMode: true,
      isActive: true,
      updatedAt: true
    }
  });
};

// ---- Delete ----
export const deleteSlot = (slotId) => {
  return prisma.timeSlot.delete({
    where: { id: Number(slotId) },
    select: { id: true }
  });
};
