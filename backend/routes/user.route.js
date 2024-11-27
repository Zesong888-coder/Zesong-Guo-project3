import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getProfile, followUser, getSuggestedUser, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getProfile);
router.get("/suggested", protectRoute, getSuggestedUser);
router.post("/follow/:id", protectRoute, followUser);
router.post("/update", protectRoute, updateUser);

export default router;