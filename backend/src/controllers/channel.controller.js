import { AVATAR_DIMENSIONS, COVER_IMAGE_DIMENSIONS, THUMBNAIL_DIMENSIONS, VIDEO_DIMENSIONS } from "../constants/constant.js";
import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import LikesDislikes from "../models/likedislike.model.js";
import View from "../models/view.model.js";
import { deleteMultipleMedia, getOptimizedUrl, uploadToCloudinary } from "../utils/cloudinary.js";
import { doEmptyFieldExist, isValidMongoDBObjectId } from "../utils/validations.js";

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
            return res.status(404).json({ error: null, message: "Channel not found !" });
        }

        res.status(200)
            .send({
                status: "Success",
                message: "Channel fetched successfully",
                data: channel
            });

    } catch (error) {
        console.log("Get Channel by Id Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: null,
                message: "Get Channel by Id:: Internal Server Error"
            });
    }
}

export async function createChannel(req, res, next) {
    try {
        const { userId, handle, title, description } = req.body;

        if (!doEmptyFieldExist(userId, handle, title, description)) {
            return res.status(400).json({ error: null, message: "Required fields are missing !" });
        }

        if (!isValidMongoDBObjectId(userId)) {
            return res.status(400).json({ error: null, message: "User Id is not a valid Id !" });
        }

        const [user, existingChannel] = await Promise.all([
            User.findById(userId).select("_id"),
            Channel.findOne({ handle }).select("_id")
        ]);

        if (!user) {
            return res.status(404).json({ error: null, message: "User not found ! Register to create channel !" });
        }

        if (existingChannel) {
            return res.status(400).json({ error: null, message: "Channel with this handle already exists !" });
        }

        // Handle images
        const images = req.files;

        if (!images || !images[0] || !images[1]) {
            return res.status(400).json({ error: null, message: "Images are required !" });
        }

        if (images.some((image) => !image.mimetype.startsWith("image"))) {
            return res.status(400).json({ error: null, message: "Only images are allowed !" });
        }

        if (images.some((image) => !image.size <= 2 * 1024 * 1024)) {
            return res.status(400).json({ error: null, message: "Images upto 2mb size are only allowed !" });
        }

        const coverImagePath = images[0].path
        const avatarPath = images[1].path

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
            return res.status(500).json({ error: error.message || error, message: "Cloudinary Channel Images Upload Error:: Internal Server Error !" });
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
            return res.status(400).json({ error: null, message: "An error occurred while creating the channel !" });
        }

        res.status(200)
            .send({
                status: "Success",
                message: "Channel created successfully",
                data: channel
            });

    } catch (error) {
        console.log("Created Channel Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: null,
                message: "Created Channel:: Internal Server Error"
            });
    }
}

export async function updateChannelById(req, res, next) {
    try {
        const { channelId, userId, title, description } = req.body;

        if (!doEmptyFieldExist(channelId, userId)) {
            return res.status(400).json({ error: null, message: "Required fields are missing !" });
        }

        if (title.trim() === "" || description.trim() === "") {
            return res.status(400).json({ error: null, message: "Title and Description cannot be empty !" });
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
            return res.status(403).json({ error: null, message: "Unauthorized access !" });
        }

        let coverImage = null;
        let avatar = null;
        let coverImageUrl = null;
        let avatarUrl = null;

        if (req.files && req.files.length > 0) {
            try {
                // Check images type and size
                if (req.files.some((image) => !image.mimetype.startsWith("image"))) {
                    return res.status(400).json({ error: null, message: "Only images are allowed !" });
                }

                if (req.files.some((image) => !image.size <= 2 * 1024 * 1024)) {
                    return res.status(400).json({ error: null, message: "Images upto 2mb size are only allowed !" });
                }

                // delete current Images which has to be updated
                if (req.files.length === 2) {
                    await deleteMultipleMedia([channel.coverImagePublicId, channel.avatarPublicId]);

                    [coverImage, avatar] = await Promise.all([
                        uploadToCloudinary(req.files[0].path),
                        uploadToCloudinary(req.files[1].path)
                    ]);

                    coverImageUrl = getOptimizedUrl(coverImage.public_id, coverImage.resource_type, COVER_IMAGE_DIMENSIONS.width, COVER_IMAGE_DIMENSIONS.height) || coverImage.secure_url;
                    avatarUrl = getOptimizedUrl(avatar.public_id, avatar.resource_type, AVATAR_DIMENSIONS.width, AVATAR_DIMENSIONS.height) || avatar.secure_url;

                } else if (req.files[0].fieldname === "avatar") {
                    await deleteMultipleMedia([channel.avatarPublicId]);

                    avatar = await uploadToCloudinary(req.files[0].path);
                    avatarUrl = getOptimizedUrl(avatar.public_id, avatar.resource_type, AVATAR_DIMENSIONS.width, AVATAR_DIMENSIONS.height) || avatar.secure_url;
                } else if (req.files[0].fieldname === "coverImage") {
                    await deleteMultipleMedia([channel.coverImagePublicId]);

                    coverImage = await uploadToCloudinary(req.files[0].path);
                    coverImageUrl = getOptimizedUrl(coverImage.public_id, coverImage.resource_type, COVER_IMAGE_DIMENSIONS.width, COVER_IMAGE_DIMENSIONS.height) || coverImage.secure_url;
                }
            } catch (error) {
                console.log("Cloudinary Channel Images Updation Error: ", error.message || error);
                return res.status(500).json({ error: error.message || error, message: "Cloudinary Channel Images Updation:: Internal Server Error !" });
            }
        }

        // Update fields explicitly
        if (title !== undefined) channel.title = title;
        if (description !== undefined) channel.description = description;

        if (coverImage) {
            channel.coverImage = coverImageUrl;
            channel.coverImagePublicId = coverImage.public_id;
        }

        if (avatar) {
            channel.avatar = avatarUrl;
            channel.avatarPublicId = avatar.public_id;
        }

        await channel.save();

        res.status(200)
            .send({
                status: "Success",
                message: "Channel details updated successfully",
                data: channel
            });

    } catch (error) {
        console.log("Update Channel Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: null,
                message: "Update Channel:: Internal Server Error"
            });
    }
}

export async function uploadVideo(req, res, next) {
    try {
        const { channelId, userId, title, description, categories, tags } = req.body;

        if (doEmptyFieldExist(channelId, userId, title, description)) {
            return res.status(400).json({ error: null, message: "Required fields are missing !" });
        }

        if (!isValidMongoDBObjectId(channelId) || !isValidMongoDBObjectId(userId)) {
            return res.status(400).json({ error: null, message: "Id's provided are not valid!" });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({ error: null, message: "Atleast one category should be added !" });
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
            return res.status(403).json({ error: null, message: "Unauthorized access !" });
        }

        // Handling Images
        const media = req.files;

        if (!media || media.length < 2) {
            return res.status(400).json({ error: null, message: "All media files are required !" });
        }

        if (!media[0].mimetype.startsWith("image")) {
            return res.status(400).json({ error: null, message: "First file should be an image !" });
        }

        if (!media[0].size <= 2 * 1024 * 1024) {
            return res.status(400).json({ error: null, message: "Image size exceeded ! Only 2mb files are allowed. !" });
        }

        if (!media[1].mimetype.startsWith("video")) {
            return res.status(400).json({ error: null, message: "Second file should be a video !" });
        }

        if (!media[1].size <= 100 * 1024 * 1024) {
            return res.status(400).json({ error: null, message: "Video size exceeded ! Only 100mb files are allowed." });
        }

        const videoPath = media[0].path;
        const thumbnailPath = media[1].path;

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
        } catch (error) {
            console.log("Cloudinary Video & thumbnail upload error: ", error.message || error);
            return res.status(400).json({ error: error.message || error, message: "Cloudinary Video & thumbnail upload:: Internal Server Error" });
        }

        const newVideo = await Video.create({
            channel: channelId,
            title,
            description,
            videoUrl: optimisedVideoUrl,
            duration: video.duration,  // in seconds
            categories,
            tags,
            thumbnail: optimisedThumbnailUrl,
            thumbnailPublicId: thumbnail.public_id
        });

        if (!newVideo) {
            return res.status(400).json({ error: null, message: "An error occurred while uploading the video !" });
        }

        res
            .status(201)
            .send({
                status: "Success",
                message: "Video uploaded successfully",
                data: newVideo
            });

    } catch (error) {
        console.log("Upload Video Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: error.message || error,
                message: "Upload Video:: Internal Server Error"
            });
    }
}

export async function updateVideoById(req, res, next) {
    try {
        const { videoId, userId, title, description, categories, tags } = req.body;

        if (doEmptyFieldExist(videoId, userId)) {
            return res.status(400).json({ error: null, message: "VideoId and UserId are required !" });
        }

        if (title && title.trim() === "") {
            return res.status(400).json({ error: null, message: "Title cannot be empty !" });
        }

        if (description && description.trim() === "") {
            return res.status(400).json({ error: null, message: "Description cannot be empty !" });
        }

        if (!isValidMongoDBObjectId(videoId) || !isValidMongoDBObjectId(userId)) {
            return res.status(400).json({ error: null, message: "Id's provided are not valid!" });
        }

        if (categories && categories.length === 0) {
            return res.status(400).json({ error: null, message: "Atleast one category should be added !" });
        }

        if (tags && tags.length === 0) {
            return res
                .status(400)
                .json({
                    error: null,
                    message: "Atleast one tag should be added !"
                });
        }

        const existingVideo = await Video.findById(videoId);

        if (!existingVideo) {
            return res.status(404).json({ error: null, message: "Video not found !" });
        }

        // Handling channel existence
        const existingChannel = await Channel.findById(existingVideo.channel);

        if (existingChannel.user.toString() !== userId) {
            return res.status(403).json({ error: null, message: "Unauthorized access !" });
        }

        // Handling Images
        const media = req.file;

        if (media) {
            if (!media.mimetype.startsWith("image")) {
                return res.status(400).json({ error: null, message: "First file should be an image !" });
            }

            if (!media.size <= 2 * 1024 * 1024) {
                return res.status(400).json({ error: null, message: "Image size exceeded ! Only 2mb files are allowed. !" });
            }

            const thumbnailPath = media.path;

            let thumbnail = null;
            let optimisedThumbnailUrl = null;

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
                categories: categories && categories.length > 0 ? categories : existingVideo.categories,
                tags: tags && tags.length > 0 ? tags : existingVideo.tags,
                thumbnail: optimisedThumbnailUrl ? optimisedThumbnailUrl : existingVideo.thumbnail,
                thumbnailPublicId: thumbnail ? thumbnail.public_id : existingVideo.thumbnailPublicId
            },
            { runValidators: true, new: true }
        );

        await updatedVideo.save();

        if (!updatedVideo) {
            return res.status(400).json({ error: null, message: "An error occurred while updating the video !" });
        }

        res
            .status(200)
            .send({
                status: "Success",
                message: "Video Updated successfully",
                data: updatedVideo
            });

    } catch (error) {
        console.log("Update Video Error: ", error.message || error);
        return res
            .status(500)
            .json({
                error: error.message || error,
                message: "Update Video:: Internal Server Error"
            });
    }
}

export async function deleteVideoById(req, res, next) {
    try {
        const { videoId, userId } = req.body;

        if (doEmptyFieldExist(videoId, userId)) {
            return res.status(400).json({ error: null, message: "VideoId and UserId are required !" });
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
            return res.status(403).json({ error: null, message: "Unauthorized access !" });
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

        const deleteCount = await Video.findByIdAndDelete(videoId);

        if (!deleteCount) {
            return res.status(400).json({ error: null, message: "Video deletion failed!" });
        }

        let deleteCommentsCount = 0;
        let deleteLikesCount = 0;
        let deleteViewsCount = 0;

        try {
            // Deleting associated comments, likes, views, etc.
            [deleteCommentsCount, deleteLikesCount, deleteViewsCount] = await Promise.all([
                Comment.deleteMany({ video: videoId }),
                LikesDislikes.deleteMany({ video: videoId }),
                View.deleteMany({ video: videoId })
            ]);
        } catch (error) {
            console.log("Delete Video Associated Data Error: ", error.message || error);
            return res.status(500).json({ error: error.message || error, message: "Delete Video Associated Data:: Internal Server Error" });
        }

        res
            .status(200)
            .send({
                status: "Success",
                message: "Video Deleted successfully",
                data: { videoId, videoDeleteCount: deleteCount, deleteCommentsCount, deleteLikesCount, deleteViewsCount }
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