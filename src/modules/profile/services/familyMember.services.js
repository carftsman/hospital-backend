import {
  createFamilyMember,
  getFamilyMembers,
  getFamilyMemberById,
  updateFamilyMember,
  deleteFamilyMember,
  deleteAllFamilyMembers
} from "../repositories/familyMember.repositories.js";

export const addFamilyMemberService = async (userId, body) => {
  return await createFamilyMember(userId, body);
};

export const getAllFamilyMembersService = async (userId) => {
  return await getFamilyMembers(userId);
};

export const getFamilyMemberByIdService = async (id, userId) => {
  return await getFamilyMemberById(id, userId);
};

export const updateFamilyMemberService = async (id, userId, body) => {
  return await updateFamilyMember(id, userId, body);
};

export const removeFamilyMemberService = async (id, userId) => {
  return await deleteFamilyMember(id, userId);
};

export const removeAllFamilyMemberService = async(userId)=>{
    return await deleteAllFamilyMembers(userId);
}