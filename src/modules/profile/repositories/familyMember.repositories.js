import prisma from "../../../../src/prisma/client.js";

export const createFamilyMember = (userId, data) => {
  return prisma.familyMember.create({
    data: { ...data, userId }
  });
};

export const getFamilyMembers = (userId) => {
  return prisma.familyMember.findMany({
    where: { userId }  
  });
};

export const getFamilyMemberById = (id, userId) => {
  return prisma.familyMember.findFirst({
    where: { id, userId },   
    include: { FamilyReport: true }  
  });
};

export const updateFamilyMember = (id, userId, data) => {
  return prisma.familyMember.updateMany({
    where: { id, userId },   
    data
  });
};

export const deleteFamilyMember = (id, userId) => {
  return prisma.familyMember.deleteMany({
    where: { id, userId }  
  });
};

export const deleteAllFamilyMembers = (userId) => {
  return prisma.familyMember.deleteMany({
    where: { userId }
  });
};