import {
  addFamilyMemberService,
  getAllFamilyMembersService,
  getFamilyMemberByIdService,
  updateFamilyMemberService,
  removeFamilyMemberService,
  removeAllFamilyMemberService
} from "../services/familyMember.services.js";

export const addFamilyMember = async (req, res) => {
  try {
    const member = await addFamilyMemberService(req.user.id, req.body);
    res.status(201).json({
      message: "Family member added successfully",
      member
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllFamilyMembers = async (req, res) => {
  try {
    const members = await getAllFamilyMembersService(req.user.id);
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFamilyMemberById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const member = await getFamilyMemberByIdService(
      id,
      req.user.id
    );

    if (!member) {
      return res.status(404).json({ message: "Family member not found" });
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateFamilyMember = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await updateFamilyMemberService(
      id,
      req.user.id,
      req.body
    );

    if (result.count === 0) {
      return res.status(404).json({ message: "Family member not found" });
    }

    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeFamilyMember = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await removeFamilyMemberService(
      id,
      req.user.id
    );

    if (result.count === 0) {
      return res.status(404).json({
        message: "Family member not found"
      });
    }

    return res.status(200).json({
      message: "Family member deleted successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

export const removeAllFamilyMembers = async (req,res) =>{
  try{
      const result = await removeAllFamilyMemberService(req.user.id);

    res.json({
      message: "All family members deleted successfully",
      deletedCount: result.count
    });
  }
  catch(err){
       res.status(500).json({message:err.message})
  }
}