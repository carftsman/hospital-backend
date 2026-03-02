import {
  addFamilyMemberService,
  getAllFamilyMembersService,
  getFamilyMemberByIdService,
  updateFamilyMemberService,
  removeFamilyMemberService,
  removeAllFamilyMemberService
} from "../services/familyMember.services.js";

import { uploadToAzure } from "../../../utils/azureBlob.js";


// ADD
export const addFamilyMember = async (req, res) => {
  try {
    let photoUrl = null;

    if (req.file) {
      photoUrl = await uploadToAzure(req.file);
    }

    const member = await addFamilyMemberService(
      req.user.id,
      { ...req.body, photo: photoUrl }
    );

    res.status(201).json({
      message: "Family member added successfully",
      member
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// GET ALL
export const getAllFamilyMembers = async (req, res) => {
  try {
    const members = await getAllFamilyMembersService(req.user.id);
    res.json(members);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// GET BY ID
export const getFamilyMemberById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const member = await getFamilyMemberByIdService(
      id,
      req.user.id
    );

    res.json(member);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// UPDATE
export const updateFamilyMember = async (req, res) => {
  try {
    const id = Number(req.params.id);

    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadToAzure(req.file);
    }

    const result = await updateFamilyMemberService(
      id,
      req.user.id,
      { ...req.body, photo: photoUrl }
    );

    res.json({
      message: "Updated successfully",
      result
    });

  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    res.status(400).json({ message: err.message });
  }
};


// DELETE ONE
export const removeFamilyMember = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await removeFamilyMemberService(id, req.user.id);

    res.json({
      message: "Family member deleted successfully"
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// DELETE ALL
export const removeAllFamilyMembers = async (req, res) => {
  try {
    const result = await removeAllFamilyMemberService(req.user.id);

    res.json({
      message: "All family members deleted successfully",
      deletedCount: result.count
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};