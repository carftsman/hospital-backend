import express from "express";
import adminAuth from "../../../../middlewares/adminAuth.js";
import { updateOpenStatus } from "../controllers/openStatus.controller.js";

const router = express.Router();

router.put("/open-status/:id", adminAuth, updateOpenStatus);

export default router;
