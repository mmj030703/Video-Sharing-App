import express from "express";
import { updateLikesDislikes } from "../controllers/likesDislikes.controller.js";
import authenticateUser from "../middlewares/authenticate.middleware.js";

const likesDislikesRouter = express.Router();

// Routes
likesDislikesRouter.post("/update-likes-dislikes", authenticateUser, updateLikesDislikes); // add authentication middleware

export default likesDislikesRouter;