import express from "express";
import { getLikesDislikesStatusOfLoggedInUser, updateLikesDislikes } from "../controllers/likesDislikes.controller.js";
import authenticateUser from "../middlewares/authenticate.middleware.js";

const likesDislikesRouter = express.Router();

// Routes
likesDislikesRouter.post("/update-likes-dislikes/:id", authenticateUser, updateLikesDislikes); // add authentication middleware
likesDislikesRouter.post("/user-status/:id", authenticateUser, getLikesDislikesStatusOfLoggedInUser) // id is videoId

export default likesDislikesRouter;