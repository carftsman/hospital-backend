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

import { upload } from "../../../middlewares/upload.middleware.js";

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
 *         multipart/form-data:
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
 *                 description: Full name (alphabets and spaces only)
 *               relation:
 *                 type: string
 *                 enum: [FATHER, MOTHER, SON, DAUGHTER, SISTER, BROTHER, SELF, COUSIN, HUSBAND, WIFE, GRANDFATHER ,GRANDMOTHER, FRIEND, GRANDSON GRANDDAUGHTER,OTHERS]
 *                 example: FATHER
 *                 description: Relation with the user
 *               age:
 *                 type: integer
 *                 example: 50
 *                 description: Age must be a positive number
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *                 example: MALE
 *                 description: Gender of the family member
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *                 description: 10 digit phone number
 *               email:
 *                 type: string
 *                 example: "john@gmail.com"
 *                 description: Allowed domains - gmail.com,yahoo.com,zoho.com,outlook.com
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Upload a photo of the family member (optional)
 *     responses:
 *       201:
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
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     photo:
 *                       type: string
 *                       description: URL of uploaded photo
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, upload.single("photo"), addFamilyMember);




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
 *     summary: Update a family member
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
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *                 description: Full name (alphabets and spaces only)
 *               relation:
 *                 type: string
 *                 enum: [FATHER, MOTHER, SON, DAUGHTER, SISTER, BROTHER, OTHERS]
 *                 example: DAUGHTER
 *                 description: Relation with the user
 *               age:
 *                 type: integer
 *                 example: 25
 *                 description: Age must be a positive number
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *                 example: FEMALE
 *                 description: Gender of the family member
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *                 description: 10 digit phone number
 *               email:
 *                 type: string
 *                 example: "jane@gmail.com"
 *                 description: Allowed domains - gmail.com, yahoo.com, outlook.com, zoho.com
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Upload a new photo (optional)
 *     responses:
 *       200:
 *         description: Family member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Family member not found
 */

router.patch("/:id",authenticate,upload.single("photo"),updateFamilyMember);




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