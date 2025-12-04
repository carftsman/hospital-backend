import express from "express";
import { searchSuggestions } from "../controllers/suggestions.controller.js";

const router = express.Router();

router.post("/HospitalHomesuggestions", searchSuggestions);

export default router;
