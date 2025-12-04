import express from "express";
import { modeSuggestions } from "../controllers/modeSuggestion.controller.js";

const router = express.Router();

router.post("/modeSuggestions", modeSuggestions);

export default router;
