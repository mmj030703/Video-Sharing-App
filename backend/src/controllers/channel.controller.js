import { AVATAR_DIMENSIONS, COVER_IMAGE_DIMENSIONS, THUMBNAIL_DIMENSIONS, VIDEO_DIMENSIONS } from "../constants/constant.js";
import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import LikesDislikes from "../models/likedislike.model.js";
import View from "../models/view.model.js";
import { deleteMultipleMedia, getOptimizedUrl, uploadToCloudinary } from "../utils/cloudinary.js";
import { doEmptyFieldExist, isValidMongoDBObjectId } from "../utils/validations.js";
import fs from "fs";
import Comment from "../models/comment.model.js";
import mongoose from "mongoose";

export async function getChannelById(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: null, message: "Channel Id is not provided !" });
        }

        if (!isValidMongoDBObjectId(id)) {
            return res.status(400).json({ error: null, message: "Channel Id is not a valid Id !" });
        }

        const channel = await Channel.findById(id);

        if (!channel) {
            return res.status(404).json({ error: null, errorCode: "CHANNEL_NOT_FOUND", message: "Channel not found !" });
        }

        res.status(200)
            .send({
                status: "success",
                message: "Channel fetched successfully",
                data: channel
            });

    } catch (error) {
        console.log("Get Channel by Id Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: null,
                errorCode: "GET_CHANNEL_ERROR",
                message: "Get Channel by Id:: Internal Server Error"
            });
    }
}

export async function createChannel(req, res, next) {
    try {
        const { userId, handle: channelHandle, channelName: title, description } = req.body;

        if (doEmptyFieldExist(userId, channelHandle, title, description)) {
            return res.status(400).json({ error: null, errorCode: "FIELDS_MISSING", message: "Required fields are missing !" });
        }

        if (!isValidMongoDBObjectId(userId)) {
            return res.status(400).json({ error: null, message: "User Id is not a valid Id !" });
        }

        // Handle images
        // req.file -> structure -> 
        /*
            { // req.files
                
                Fields as arrays
                fieldName: [ 
                    {obj} 
                ] 
            }
        */
        const images = req.files;   // req.files is an object

        if (!images || Object.keys(images).length < 2) {
            return res.status(400).json({ error: null, errorCode: "IMAGES_NOT_UPLOADED", message: "Images are required !" });
        }

        if (Object.keys(images).some((imageKey) => !(images[imageKey][0].mimetype.startsWith("image")))) {
            return res.status(400).json({ error: null, errorCode: "NOT_IMAGE_ERROR", message: "Only images are allowed !" });
        }

        if (Object.keys(images).some((imageKey) => !(images[imageKey][0].size <= 2 * 1024 * 1024))) {
            return res.status(400).json({ error: null, errorCode: "IMAGE_SIZE_EXCEEDED", message: "Images upto 2mb size are only allowed !" });
        }

        const handle = channelHandle.toLowerCase();

        const [user, existingChannel] = await Promise.all([
            User.findById(userId).select("_id"),
            Channel.findOne({ handle }).select("_id")
        ]);

        if (!user) {
            return res.status(404).json({ error: null, errorCode: "USER_NOT_REGISTERED", message: "User not found ! Register to create channel !" });
        }

        if (existingChannel) {
            return res.status(400).json({ error: null, errorCode: "CHANNEL_HANDLE_ALREADY_EXISTS", message: "Channel with this handle already exists !" });
        }

        const coverImagePath = images['coverImage'][0].path
        const avatarPath = images['avatar'][0].path

        let coverImage = null;
        let avatar = null;
        let coverImageUrl = null;
        let avatarUrl = null;

        try {
            [coverImage, avatar] = await Promise.all([
                uploadToCloudinary(coverImagePath),
                uploadToCloudinary(avatarPath)
            ]);

            coverImageUrl = getOptimizedUrl(coverImage.public_id, coverImage.resource_type, 720, 405);
            avatarUrl = getOptimizedUrl(avatar.public_id, avatar.resource_type, 512, 512);

        } catch (error) {
            console.log("Cloudinary Channel Images Upload Error: ", error.message || error);
            return res.status(500).json({ error: error.message || error, errorCode: "CREATE_CHANNEL_ERROR", message: "Cloudinary Channel Images Upload Error:: Internal Server Error !" });
        }

        const channel = await Channel.create({
            user: userId,
            handle,
            title,
            description,
            coverImage: coverImageUrl,
            avatar: avatarUrl,
            coverImagePublicId: coverImage.public_id,
            avatarPublicId: avatar.public_id
        });

        if (!channel) {
            return res.status(400).json({ error: null, errorCode: "CREATE_CHANNEL_ERROR", message: "An error occurred while creating the channel !" });
        }

        res.status(200)
            .send({
                status: "success",
                message: "Channel created successfully",
                data: channel
            });

    } catch (error) {
        console.log("Created Channel Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: error.message || error,
                errorCode: "CREATE_CHANNEL_ERROR",
                message: "Created Channel:: Internal Server Error"
            });
    } finally {
        // Check performance if slows convert to async using promises
        if (req.files) {
            const images = req.files;
            const imagesKeys = Object.keys(req.files);

            imagesKeys.forEach(imageKey => {
                if (fs.existsSync(images[imageKey][0].path)) {
                    fs.unlinkSync(images[imageKey][0].path);
                }
            });
        }
    }
}

export async function updateChannelById(req, res, next) {
    try {
        const { id: channelId } = req.params;
        const { userId, title, description } = req.body;

        console.log("level 1")

        if (doEmptyFieldExist(channelId, userId)) {
            return res.status(400).json({ error: null, message: "Required fields are missing !" });
        }

        if ((title.trim() === "") || (description.trim() === "")) {
            return res.status(400).json({ error: null, errorCode: "FIELDS_EMPTY", message: "Title and Description cannot be empty !" });
        }

        if (!isValidMongoDBObjectId(userId)) {
            return res.status(400).json({ error: null, message: "User Id is not a valid Id !" });
        }

        const [channel, existingUser] = await Promise.all([
            Channel.findById(channelId),
            User.findById(userId).select("_id")
        ]);

        if (!channel) {
            return res.status(404).json({ error: null, message: "Channel not found !" });
        }

        if (!existingUser) {
            return res.status(404).json({ error: null, message: "User not found !" });
        }

        if (channel.user.toString() !== userId) {
            return res.status(403).json({ error: null, errorCode: "UNAUTHORISED_ERROR", message: "Unauthorized access !" });
        }

        console.log("level 2")

        let coverImage = null;
        let avatar = null;
        let coverImageUrl = null;
        let avatarUrl = null;

        // console.log(req.files)

        if (req.files && Object.keys(req.files).length > 0) {
            try {
                // Check images type and size
                if (Object.keys(req.files).some((image) => !req.files[image][0].mimetype.startsWith("image"))) {
                    return res.status(400).json({ error: null, errorCode: "NOT_IMAGE_ERROR", message: "Only images are allowed !" });
                }

                if (Object.keys(req.files).some((image) => !(req.files[image][0].size <= 2 * 1024 * 1024))) {
                    return res.status(400).json({ error: null, errorCode: "IMAGE_SIZE_EXCEEDED", message: "Images upto 2mb size are only allowed !" });
                }

                // delete current Images which has to be updated
                if (Object.keys(req.files).length === 2) {
                    await deleteMultipleMedia([channel.coverImagePublicId, channel.avatarPublicId]);

                    [coverImage, avatar] = await Promise.all([
                        uploadToCloudinary(req.files[Object.keys(req.files)[0]][0].path),
                        uploadToCloudinary(req.files[Object.keys(req.files)[1]][0].path)
                    ]);

                    coverImageUrl = getOptimizedUrl(coverImage.public_id, coverImage.resource_type, COVER_IMAGE_DIMENSIONS.width, COVER_IMAGE_DIMENSIONS.height) || coverImage.secure_url;
                    avatarUrl = getOptimizedUrl(avatar.public_id, avatar.resource_type, AVATAR_DIMENSIONS.width, AVATAR_DIMENSIONS.height) || avatar.secure_url;

                } else if (Object.keys(req.files)[0] === "avatar") {
                    await deleteMultipleMedia([channel.avatarPublicId]);

                    avatar = await uploadToCloudinary(req.files[Object.keys(req.files)[0]][0].path);
                    avatarUrl = getOptimizedUrl(avatar.public_id, avatar.resource_type, AVATAR_DIMENSIONS.width, AVATAR_DIMENSIONS.height) || avatar.secure_url;
                } else if (Object.keys(req.files)[0] === "coverImage") {
                    await deleteMultipleMedia([channel.coverImagePublicId]);

                    coverImage = await uploadToCloudinary(req.files[Object.keys(req.files)[0]][0].path);
                    coverImageUrl = getOptimizedUrl(coverImage.public_id, coverImage.resource_type, COVER_IMAGE_DIMENSIONS.width, COVER_IMAGE_DIMENSIONS.height) || coverImage.secure_url;
                }
            } catch (error) {
                console.log("Cloudinary Channel Images Updation Error: ", error.message || error);
                return res.status(500).json({ error: error.message || error, errorCode: "UPDATE_CHANNEL_ERROR", message: "Cloudinary Channel Images Updation:: Internal Server Error !" });
            }
        }

        console.log("level 3")

        // console.log(avatar)
        // console.log(avatarUrl)

        // Update fields explicitly
        if (title) channel.title = title;
        if (description) channel.description = description;

        if (coverImage) {
            channel.coverImage = coverImageUrl;
            channel.coverImagePublicId = coverImage.public_id;
        }

        if (avatar) {
            channel.avatar = avatarUrl;
            channel.avatarPublicId = avatar.public_id;
        }

        await channel.save();

        console.log("level 4")

        res.status(200)
            .send({
                status: "success",
                message: "Channel details updated successfully",
                data: channel
            });

    } catch (error) {
        console.log("Update Channel Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: null,
                errorCode: "UPDATE_CHANNEL_ERROR",
                message: "Update Channel:: Internal Server Error"
            });
    } finally {
        // Check performance if slows convert to async using promises
        if (req.files) {
            const images = req.files;
            const imagesKeys = Object.keys(req.files);

            imagesKeys.forEach(imageKey => {
                if (fs.existsSync(images[imageKey][0].path)) {
                    fs.unlinkSync(images[imageKey][0].path);
                }
            });
        }
    }
}

export async function uploadVideo(req, res, next) {
    try {
        // For now we are just accepting one category from frontend. In future we will add multiple categories
        const { channelId, userId, title, description, categories: categoriesAsString } = req.body;
        const categories = JSON.parse(categoriesAsString);

        const tags = ["video", "popular", "trending"];

        if (doEmptyFieldExist(channelId, userId, title, description)) {
            return res.status(400).json({ error: null, errorCode: "FIELDS_MISSING", message: "Required fields are missing !" });
        }

        if (!isValidMongoDBObjectId(channelId) || !isValidMongoDBObjectId(userId)) {
            return res.status(400).json({ error: null, message: "Id's provided are not valid!" });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({ error: null, errorCode: "CATEGORY_NOT_SELECTED", message: "No category was selected !" });
        }

        if (!tags || tags.length === 0) {
            return res
                .status(400)
                .json({
                    error: null,
                    message: "Atleast one tag should be added !"
                });
        }

        // Handling channel existence
        const existingChannel = await Channel.findById(channelId);

        if (!existingChannel) {
            return res.status(404).json({ error: null, message: "Channel not found !" });
        }

        if (existingChannel.user.toString() !== userId) {
            return res.status(403).json({ error: null, errorCode: "UNAUTHORISED_ERROR", message: "Unauthorized access !" });
        }

        // Handling Images
        const media = req.files;

        console.log(media);


        if (!media || Object.keys(media).length < 2) {
            return res.status(400).json({ error: null, errorCode: "MEDIA_FILES_NOT_UPLOADED", message: "All media files are required !" });
        }

        if (!media['thumbnail'][0].mimetype.startsWith("image")) {
            return res.status(400).json({ error: null, errorCode: "FIRST_FILE_IMAGE_ONLY", message: "First file should be an image !" });
        }

        if (!(media['thumbnail'][0].size <= 2 * 1024 * 1024)) {
            return res.status(400).json({ error: null, errorCode: "IMAGE_SIZE_EXCEEDED", message: "Image size exceeded ! Only 2mb files are allowed. !" });
        }

        if (!media['video'][0].mimetype.startsWith("video")) {
            return res.status(400).json({ error: null, errorCode: "SECOND_FILE_VIDEO_ONLY", message: "Second file should be a video !" });
        }

        if (!(media['video'][0].size <= 50 * 1024 * 1024)) {
            return res.status(400).json({ error: null, errorCode: "VIDEO_SIZE_EXCEEDED", message: "Video size exceeded ! Only 100mb files are allowed." });
        }

        const videoPath = media['video'][0].path;
        const thumbnailPath = media['thumbnail'][0].path;

        let video = null;
        let thumbnail = null;
        let optimisedVideoUrl = null;
        let optimisedThumbnailUrl = null;

        try {
            [video, thumbnail] = await Promise.all([
                uploadToCloudinary(videoPath),
                uploadToCloudinary(thumbnailPath)
            ]);


            optimisedVideoUrl = getOptimizedUrl(video.public_id, video.resource_type, VIDEO_DIMENSIONS.width, VIDEO_DIMENSIONS.height) || video.secure_url;
            optimisedThumbnailUrl = getOptimizedUrl(thumbnail.public_id, thumbnail.resource_type, THUMBNAIL_DIMENSIONS.width, THUMBNAIL_DIMENSIONS.height) || thumbnail.secure_url;
            console.log(optimisedVideoUrl, optimisedThumbnailUrl);
        } catch (error) {
            console.log("Cloudinary Video & thumbnail upload error: ", error.message || error);
            return res.status(400).json({ error: error.message || error, errorCode: "VIDEO_UPLOAD_ERROR", message: "Cloudinary Video & thumbnail upload:: Internal Server Error" });
        }

        const newVideo = await Video.create({
            channel: channelId,
            title,
            description,
            videoUrl: optimisedVideoUrl,
            videoPublicId: video.public_id,
            categories: categories.map(categoryId => new mongoose.Types.ObjectId(categoryId)),
            duration: video.duration,  // in seconds
            tags,
            thumbnail: optimisedThumbnailUrl,
            thumbnailPublicId: thumbnail.public_id
        });

        if (!newVideo) {
            return res.status(400).json({ error: null, errorCode: "VIDEO_UPLOAD_ERROR", message: "An error occurred while uploading the video !" });
        }

        res
            .status(201)
            .send({
                status: "success",
                message: "Video uploaded successfully",
                data: newVideo
            });

    } catch (error) {
        console.log("Upload Video Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: error.message || error,
                errorCode: "VIDEO_UPLOAD_ERROR",
                message: "Upload Video:: Internal Server Error"
            });
    } finally {
        // Check performance if slows convert to async using promises
        if (req.files) {
            const mediafiles = req.files;
            const keys = Object.keys(mediafiles);

            keys.forEach(Key => {
                if (fs.existsSync(mediafiles[Key][0].path)) {
                    fs.unlinkSync(mediafiles[Key][0].path);
                }
            });
        }
    }
}

export async function updateVideoById(req, res, next) {
    try {
        const { id: videoId } = req.params;
        const { userId, title, description } = req.body;

        if (doEmptyFieldExist(videoId, userId)) {
            return res.status(400).json({ error: null, message: "VideoId and UserId are required !" });
        }

        if (title.trim() === "") {
            return res.status(400).json({ error: null, errorCode: "FIELDS_EMPTY", message: "Title cannot be empty !" });
        }

        if (description.trim() === "") {
            return res.status(400).json({ error: null, errorCode: "FIELDS_EMPTY", message: "Description cannot be empty !" });
        }

        if (!isValidMongoDBObjectId(videoId) || !isValidMongoDBObjectId(userId)) {
            return res.status(400).json({ error: null, message: "Id's provided are not valid!" });
        }

        const existingVideo = await Video.findById(videoId);

        if (!existingVideo) {
            return res.status(404).json({ error: null, message: "Video not found !" });
        }

        // Handling channel existence
        const existingChannel = await Channel.findById(existingVideo.channel);

        if (existingChannel.user.toString() !== userId) {
            return res.status(403).json({ error: null, errorCode: "UNAUTHORISED_ERROR", message: "Unauthorized access !" });
        }

        // Handling Images
        const media = req.file;
        let thumbnail = null;
        let optimisedThumbnailUrl = null;

        if (media) {
            if (!media.mimetype.startsWith("image")) {
                return res.status(400).json({ error: null, errorCode: "NOT_IMAGE_ERROR", message: "First file should be an image !" });
            }

            if (!(media.size <= 2 * 1024 * 1024)) {
                return res.status(400).json({ error: null, errorCode: "IMAGE_SIZE_EXCEEDED", message: "Image size exceeded ! Only 2mb files are allowed. !" });
            }

            const thumbnailPath = media.path;

            try {
                await deleteMultipleMedia([existingVideo.thumbnailPublicId]);
                thumbnail = await uploadToCloudinary(thumbnailPath);

                optimisedThumbnailUrl = getOptimizedUrl(thumbnail.public_id, thumbnail.resource_type, THUMBNAIL_DIMENSIONS.width, THUMBNAIL_DIMENSIONS.height) || thumbnail.secure_url;
            } catch (error) {
                console.log("Cloudinary Thumbnail upload error: ", error.message || error);
                return res.status(400).json({ error: error.message || error, message: "Cloudinary Video & thumbnail upload:: Internal Server Error" });
            }
        }

        const updatedVideo = await Video.updateOne(
            { _id: videoId },
            {
                title: title && title.trim() !== "" ? title : existingVideo.title,
                description: description && description.trim() !== "" ? description : existingVideo.description,
                thumbnail: optimisedThumbnailUrl ? optimisedThumbnailUrl : existingVideo.thumbnail,
                thumbnailPublicId: thumbnail ? thumbnail.public_id : existingVideo.thumbnailPublicId
            },
            { runValidators: true, new: true }
        );

        if (!updatedVideo) {
            return res.status(400).json({ error: null, errorCode: "UPDATE_VIDEO_ERROR", message: "An error occurred while updating the video !" });
        }

        res
            .status(200)
            .send({
                status: "success",
                message: "Video Updated successfully",
                data: updatedVideo
            });

    } catch (error) {
        console.log("Update Video Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: error.message || error,
                errorCode: "UPDATE_VIDEO_ERROR",
                message: "Update Video:: Internal Server Error"
            });
    } finally {
        // Check performance if slows convert to async using promises
        if (req.file) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    }
}

export async function deleteVideoById(req, res, next) {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (doEmptyFieldExist(id, userId)) {
            return res.status(400).json({ error: null, message: "VideoId and UserId are required !" });
        }

        if (!isValidMongoDBObjectId(id) || !isValidMongoDBObjectId(userId)) {
            return res.status(400).json({ error: null, message: "Id's provided are not valid!" });
        }

        const existingVideo = await Video.findById(id);

        if (!existingVideo) {
            return res.status(404).json({ error: null, message: "Video not found !" });
        }

        // Handling channel existence
        const existingChannel = await Channel.findById(existingVideo.channel);

        if (existingChannel.user.toString() !== userId) {
            return res.status(403).json({ error: null, message: "Unauthorized access !" });
        }

        const deleteCount = await Video.findByIdAndDelete(id);

        if (!deleteCount) {
            return res.status(400).json({ error: null, message: "Video deletion failed!" });
        }

        let maxTries = 3;
        let currentTry = 0;

        while (currentTry < maxTries) {
            try {
                const response = await deleteMultipleMedia([existingVideo.thumbnailPublicId, existingVideo.videoPublicId]);
                break;

            } catch (error) {
                currentTry++;

                if (currentTry === maxTries) {
                    console.log("Cloudinary Video & Thumbnail delete error: ", error.message || error);
                    return res.status(400).json({ error: error.message || error, message: "Cloudinary video & thumbnail delete:: Internal Server Error" });
                }

                await new Promise(resolve => setTimeout(resolve, currentTry * 1000)); // wait for 1, 2, 3 seconds before next try
            }
        }

        let deleteCommentsCount = 0;
        let deleteLikesCount = 0;
        let deleteViewsCount = 0;

        try {
            // Deleting associated comments, likes, views, etc.
            [deleteCommentsCount, deleteLikesCount, deleteViewsCount] = await Promise.all([
                Comment.deleteMany({ video: id }),
                LikesDislikes.deleteMany({ video: id }),
                View.deleteMany({ video: id })
            ]);
        } catch (error) {
            console.log("Delete Video Associated Data Error: ", error.message || error);
            return res.status(500).json({ error: error.message || error, message: "Delete Video Associated Data:: Internal Server Error" });
        }

        res
            .status(200)
            .send({
                status: "success",
                message: "Video Deleted successfully",
                data: { videoId: id, videoDeleteCount: deleteCount, deleteCommentsCount, deleteLikesCount, deleteViewsCount }
            });

    } catch (error) {
        console.log("Delete Video Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: error.message || error,
                message: "Delete Video:: Internal Server Error"
            });
    }
}