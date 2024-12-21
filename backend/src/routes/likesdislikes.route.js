import express from "express";
import { updateLikesDislikes } from "../controllers/likesDislikes.controller.js";

const likesDislikesRouter = express.Router();

// Routes
likesDislikesRouter.post("/update-likes-dislikes", updateLikesDislikes); // add authentication middleware

export default likesDislikesRouter;