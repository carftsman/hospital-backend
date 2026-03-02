import {
  createFamilyMember,
  getFamilyMembers,
  getFamilyMemberById,
  updateFamilyMember,
  deleteFamilyMember,
  deleteAllFamilyMembers
} from "../repositories/familyMember.repositories.js";

const emailRegex =
  /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|zoho\.com)$/;

const nameRegex = /^[A-Za-z\s]+$/;

const phoneRegex = /^[0-9]{10}$/;


// ADD
export const addFamilyMemberService = async (userId, body) => {

  const data = {};

  // Full Name
  if (!body.fullName || !nameRegex.test(body.fullName)) {
    throw new Error("Full name must contain only alphabets");
  }
  data.fullName = body.fullName.trim();

  // Relation
  if (!body.relation) {
    throw new Error("Relation is required");
  }
  data.relation = body.relation;

  // Age
  if (body.age !== undefined) {
    const age = parseInt(body.age, 10);
    if (isNaN(age) || age <= 0) {
      throw new Error("Age must be a positive number");
    }
    data.age = age;
  }

  // Email
  if (body.email !== undefined) {
    const email = body.email.trim();
    if (!emailRegex.test(email)) {
      throw new Error(
        "Email must be valid and only from gmail, yahoo, outlook, zoho"
      );
    }
    data.email = email;
  }

  // Phone (Exactly 10 digits)
  if (body.phone !== undefined) {
    const phone = body.phone.trim();

    if (!phoneRegex.test(phone)) {
      throw new Error("Phone number must contain exactly 10 digits");
    }

    data.phone = phone;
  }

  // Gender
  if (body.gender !== undefined) data.gender = body.gender;

  // Photo
  if (body.photo !== undefined) data.photo = body.photo;

  return await createFamilyMember(userId, data);
};


// GET ALL
export const getAllFamilyMembersService = async (userId) => {
  const members = await getFamilyMembers(userId);
  return members.sort((a, b) => b.id - a.id);
};


// GET BY ID
export const getFamilyMemberByIdService = async (id, userId) => {
  const member = await getFamilyMemberById(id, userId);

  if (!member) {
    throw new Error("Family member not found");
  }

  return member;
};


// UPDATE
export const updateFamilyMemberService = async (id, userId, body) => {

  const existing = await getFamilyMemberById(id, userId);
  if (!existing) {
    throw new Error("Family member not found");
  }

  const data = {};

  if (body.fullName) {
    if (!nameRegex.test(body.fullName)) {
      throw new Error("Full name must contain only alphabets");
    }
    data.fullName = body.fullName.trim();
  }

  if (body.age) {
    const age = parseInt(body.age, 10);
    if (isNaN(age) || age <= 0) {
      throw new Error("Age must be positive");
    }
    data.age = age;
  }

  if (body.email) {
    const email = body.email.trim();
    if (!emailRegex.test(email)) {
      throw new Error(
        "Email must be valid and only from gmail, yahoo, outlook, hotmail, icloud"
      );
    }
    data.email = email;
  }

  if (body.relation) data.relation = body.relation;
  if (body.gender) data.gender = body.gender;
  if (body.phone) data.phone = body.phone;
  if (body.photo) data.photo = body.photo;

  return await updateFamilyMember(id, userId, data);
};


// DELETE ONE
export const removeFamilyMemberService = async (id, userId) => {

  const existing = await getFamilyMemberById(id, userId);
  if (!existing) {
    throw new Error("Family member not found");
  }

  return await deleteFamilyMember(id, userId);
};


// DELETE ALL
export const removeAllFamilyMemberService = async (userId) => {

  const members = await getFamilyMembers(userId);

  if (members.length === 0) {
    throw new Error("No family members to delete");
  }

  return await deleteAllFamilyMembers(userId);
};