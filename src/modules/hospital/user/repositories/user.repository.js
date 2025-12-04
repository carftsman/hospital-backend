import prisma from "../../../../prisma/client.js";

export const createUser = (data) => {
  return prisma.user.create({ data });
};

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true
    }
  });
};

export const findUserByPhone = (phone) => {
  return prisma.user.findUnique({
    where: { phone },
    select: { id: true }
  });
};
