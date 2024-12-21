import express from "express";
import { getAllVideosByCategory, getVideoById, getVideosByChannelId, getVideosByTitle } from "../controllers/video.controller.js";
import { updateVideoViews } from "../middlewares/updateVideoView.middleware.js";

const videoRouter = express.Router();

videoRouter.get("/category/:category", getAllVideosByCategory);
videoRouter.get("/:id", updateVideoViews, getVideoById);
videoRouter.get("/:channelId", getVideosByChannelId);
videoRouter.get("/search", getVideosByTitle);

export default videoRouter;