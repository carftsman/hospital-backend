import prisma from "../../../../prisma/client.js";

/**
 * findNotifications: list with booking + timeslot snapshot, ordered by newest
 * where: prisma-compatible where object (hospitalId, read, createdAt range)
 */
export const findNotifications = ({ where = {}, skip = 0, take = 25 }) => {
  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take,
    select: {
      id: true,
      hospitalId: true,
      bookingId: true,
      doctorName: true,
      hospitalName: true,
      userName: true,
      userPhone: true,
      slotStart: true,
      slotEnd: true,
      read: true,
      createdAt: true,
      // include booking snapshot and related timeSlot (if you want deeper details)
      booking: {
        select: {
          id: true,
          timeslotId: true,
          userId: true,
          userName: true,
          userEmail: true,
          userPhone: true,
          doctorId: true,
          doctorName: true,
          hospitalId: true,
          hospitalName: true,
          start: true,
          end: true,
          status: true,
          createdAt: true,
          // optionally include timeSlot basic info
          timeSlot: {
            select: {
              id: true,
              start: true,
              end: true,
              consultationMode: true,
              isActive: true
            }
          }
        }
      }
    }
  });
};

export const countNotifications = ({ where = {} }) => {
  return prisma.notification.count({ where });
};

export const findNotificationById = (id) => {
  return prisma.notification.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      hospitalId: true,
      bookingId: true,
      doctorName: true,
      hospitalName: true,
      userName: true,
      userPhone: true,
      slotStart: true,
      slotEnd: true,
      read: true,
      createdAt: true,
      booking: {
        select: {
          id: true,
          timeslotId: true,
          userId: true,
          userName: true,
          userEmail: true,
          userPhone: true,
          doctorId: true,
          doctorName: true,
          hospitalId: true,
          hospitalName: true,
          start: true,
          end: true,
          status: true,
          createdAt: true,
          timeSlot: {
            select: {
              id: true,
              start: true,
              end: true,
              consultationMode: true,
              isActive: true
            }
          }
        }
      }
    }
  });
};

export const updateNotificationRead = (id, read = true) => {
  return prisma.notification.update({
    where: { id: Number(id) },
    data: { read },
    select: {
      id: true,
      read: true,
      bookingId: true,
      createdAt: true
    }
  });
};
