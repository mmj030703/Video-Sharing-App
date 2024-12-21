import express from 'express';
import { createChannel, getChannelById, updateChannelById, uploadVideo } from '../controllers/channel.controller.js';
import { imageUpload } from '../middlewares/multer.middleware.js';

const channelRouter = express.Router();

// Routes
channelRouter.get("/:id", getChannelById);
channelRouter.post(
    "/create",
    imageUpload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "avatar", maxCount: 1 }
    ]),
    createChannel
);
channelRouter.patch("update/:id", imageUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "avatar", maxCount: 1 }
]), updateChannelById);

// Channel -> Video Related Routes
channelRouter.post("videos/upload", , uploadVideo);
channelRouter.patch("videos/update/:id", () => { });
channelRouter.delete("videos/delete/:id", () => { });

export default channelRouter;