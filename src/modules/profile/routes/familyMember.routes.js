import express from "express";
import {authenticate} from "../../../middlewares/auth.middleware.js";
import {
  addFamilyMember,
  updateFamilyMember,
  removeFamilyMember,
  getFamilyMemberById,
  getAllFamilyMembers,
  removeAllFamilyMembers
} from "../controllers/familyMember.controllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Family Member
 *   description: APIs to manage user's family members and their health reports
 */

/**
 * @swagger
 * /api/family-member:
 *   post:
 *     summary: Add a family member
 *     tags: [Family Member]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - relation
 *               - age
 *               - gender
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *                 description: Full name of the family member
 *               relation:
 *                 type: string
 *                 enum: [FATHER, MOTHER, SON, DAUGHTER, GRANDPARENT]
 *                 example: FATHER
 *                 description: Relation with the user
 *               age:
 *                 type: integer
 *                 example: 50
 *                 description: Age of the family member
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *                 example: MALE
 *                 description: Gender of the family member
 *     responses:
 *       200:
 *         description: Family member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Family member added successfully
 *                 member:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     fullName:
 *                       type: string
 *                     relation:
 *                       type: string
 *                     age:
 *                       type: integer
 *                     gender:
 *                       type: string
 */

router.post("/", authenticate, addFamilyMember);


/**
 * @swagger
 * /api/family-member:
 *   get:
 *     summary: Get all family members for logged-in user
 *     tags: [Family Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of family members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fullName:
 *                     type: string
 *                   relation:
 *                     type: string
 *                   age:
 *                     type: integer
 *                   gender:
 *                     type: string
 */

router.get("/", authenticate, getAllFamilyMembers);


/**
 * @swagger
 * /api/family-member/{id}:
 *   get:
 *     summary: Get a family member by ID
 *     tags: [Family Member]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Family member ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Family member details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 fullName:
 *                   type: string
 *                 relation:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 gender:
 *                   type: string
 */

router.get("/:id", authenticate, getFamilyMemberById);


/**
 * @swagger
 * /api/family-member/{id}:
 *   patch:
 *     summary: Edit a family member
 *     tags: [Family Member]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Family member ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *                 description: Full name of the family member
 *               relation:
 *                 type: string
 *                 enum: [FATHER, MOTHER, SON, DAUGHTER, GRANDPARENT]
 *                 example: DAUGHTER
 *                 description: Relation with the user
 *               age:
 *                 type: integer
 *                 example: 25
 *                 description: Age of the family member
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *                 example: FEMALE
 *                 description: Gender of the family member
 *     responses:
 *       200:
 *         description: Family member updated successfully
 */

router.patch("/:id", authenticate, updateFamilyMember);


/**
 * @swagger
 * /api/family-member:
 *   delete:
 *     summary: Delete all family members of logged-in user
 *     tags: [Family Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All family members deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All family members deleted successfully
 *                 deletedCount:
 *                   type: integer
 *                   example: 3
 */

router.delete("/", authenticate, removeAllFamilyMembers);




/**
 * @swagger
 * /api/family-member/{id}:
 *   delete:
 *     summary: Delete a family member
 *     tags: [Family Member]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Family member ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Family member deleted successfully (No Content)
 *       404:
 *         description: Family member not found
 */

router.delete("/:id", authenticate, removeFamilyMember);


export default router;