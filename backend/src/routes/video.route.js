import express from "express";
import { getAllVideosByCategory, getVideoById, getVideosByChannelId, getVideosByTitle } from "../controllers/video.controller.js";
import { updateVideoViews } from "../middlewares/updateVideoView.middleware.js";

const videoRouter = express.Router();

videoRouter.get("/category/:category", getAllVideosByCategory);
videoRouter.get("/video/:id", updateVideoViews, getVideoById);
videoRouter.get("/channel/:channelId", getVideosByChannelId);
videoRouter.get("/search/title", getVideosByTitle);
videoRouter.get("/reload", (req, res) => res.status(200).send("Reload Successfull !"));

export default videoRouter;