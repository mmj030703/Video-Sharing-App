import express from 'express';
import { createChannel, deleteVideoById, getChannelById, updateChannelById, updateVideoById, uploadVideo } from '../controllers/channel.controller.js';
import { dynamicUpload } from '../middlewares/multer.middleware.js';
import authenticateUser from "../middlewares/authenticate.middleware.js"

const channelRouter = express.Router();

// Routes
channelRouter.get("/:id", getChannelById);
channelRouter.post(
    "/create",
    authenticateUser,
    dynamicUpload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "avatar", maxCount: 1 }
    ]),
    createChannel
);
channelRouter.patch("update/:id", authenticateUser, dynamicUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "avatar", maxCount: 1 }
]), updateChannelById);

// Channel -> Video Related Routes
channelRouter.post("videos/upload", authenticateUser, dynamicUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]), uploadVideo);
channelRouter.patch("videos/update/:id", authenticateUser, dynamicUpload.single('thumbnail'), updateVideoById);
channelRouter.delete("videos/delete/:id", authenticateUser, deleteVideoById);

export default channelRouter;