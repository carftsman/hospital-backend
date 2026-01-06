// import prisma from "../../../../prisma/client.js";

// export const createUser = (data) => {
//   return prisma.user.create({ data });
// };

// export const findUserByEmail = (email) => {
//   return prisma.user.findUnique({
//     where: { email: email.toLowerCase() },
//     select: {
//       id: true,
//       firstName: true,
//       lastName: true,
//       email: true,
//       phone: true,
//       password: true
//     }
//   });
// };

// export const findUserByPhone = (phone) => {
//   return prisma.user.findUnique({
//     where: { phone },
//     select: {
//       id: true,
//       firstName: true,
//       lastName: true,
//       email: true,
//       phone: true,
//       password: true
//     }
//   });
// };

// export const updateUserPassword = (userId, hashedPassword) => {
//   return prisma.user.update({
//     where: { id: userId },
//     data: { password: hashedPassword }
//   });
// };
import prisma from "../../../../prisma/client.js";

export const createUser = (data) => {
  return prisma.user.create({ data });
};

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });
};

export const findUserByPhone = (phone) => {
  return prisma.user.findUnique({
    where: { phone }
  });
};

export const updateUserById = (id, data) => {
  return prisma.user.update({
    where: { id },
    data
  });
};

export const updateUserPassword = (userId, hashedPassword) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
};

export const updateUserProfile = (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data
  });
};

export const getUserProflileById = (userId) => {
  return prisma.user.findUnique({
    where: { id: userId } ,
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      bloodGroup: true,
      emContactName: true,
      emContactNumber: true,  
      onboardingStage: true
    }
  });
}