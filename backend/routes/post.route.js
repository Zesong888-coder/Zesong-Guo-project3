import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createPost, deletePost, commentOnPost, 
    likePost, 
    getAllPosts, 
    getLikedPosts,
    getUserPosts,
    getFollowingPosts, } from "../controllers/post.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.post("/like/:id", protectRoute, likePost);
router.get("/all", protectRoute, getAllPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/following", protectRoute, getFollowingPosts);


export default router;