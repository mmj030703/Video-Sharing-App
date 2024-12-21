import Comment from "../models/comment.model.js";
import LikesDislikes from "../models/likedislike.model.js";
import Video from "../models/video.model.js";
import View from "../models/view.model.js";
import { isValidMongoDBObjectId } from "../utils/validations.js";

export async function getAllVideosByCategory(req, res, next) {
    try {
        let { category } = req.params;

        if (!category || category.trim() === "") {
            return res.status(400).json({ message: "Category is required !" });
        }

        category = category.trim().toLowerCase();

        let videos;

        if (category === "all") {
            videos = await Video.find();
        } else {
            videos = await Video.find({ categories: { $in: [category] } });
        }

        if (!videos.length) {
            return res.status(404).json({ error: null, message: "No videos found for the given category !" });
        }

        res.status(200).send({ status: "success", message: "Videos fetched successfully !", data: { category, totalItems: videos.length, videos } });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Get all videos:: Internal Server Error !" });
    }
}

export async function getVideoById(req, res, next) {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string" || !isValidMongoDBObjectId(id)) {
            return res.status(400).json({ error: null, message: "Invalid video id !" });
        }

        const video = await Video
            .findById(id)
            .populate("channel");

        if (!video) {
            return res.status(404).json({ error: null, message: "No video found !" });
        }

        // Parallely fetching likes, comments, recommendedVideos to optimise time        
        const [likes, comments, recommendedVideos, views] = await Promise.all([
            LikesDislikes.find({ video: id, type: true }), // type true for like
            View.find({ video: id })
        ]);

        res.status(200).send({
            status: "success",
            message: "Video fetched successfully !",
            data: {
                video,
                likesCount: likes.length,
                viewsCount: views.length
            }
        });
    } catch (error) {
        console.log("Error fetching video by ID:", error);
        return res.status(500).json({
            error: error.message || error,
            message: "Get video by ID:: Internal Server Error !"
        });
    }
}

export async function getVideosByChannelId(req, res, next) {
    try {
        const { channelId } = req.params;

        if (!channelId || typeof channelId !== "string" || !isValidMongoDBObjectId(channelId)) {
            return res.status(400).json({ error: null, message: "Invalid channel id !" });
        }

        const videos = await Video.find({ channel: channelId });

        if (!videos.length) {
            return res.status(404).json({ error: null, message: "No videos found for the given channel !" });
        }

        res.status(200).send({ status: "success", message: "Videos fetched successfully !", data: { totalItems: videos.length, videos } });
    } catch (error) {
        return res.status(500).json({
            error: error.message || error,
            message: "Get videos by Channel ID:: Internal Server Error !"
        });
    }
}

export async function getVideosByTitle(params) {
    try {
        const { title } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({ error: null, message: "Input is empty !" })
        }

        const videos = await Video
            .find({
                $text: { $search: title } // $search will check each word in the title and try to find whether it is available in the title field or not and the search is efficient and case-insensitive
            })
            .limit(10)
            .sort({ score: { $meta: "textScore" } });  // Sort by text match relevance

        if (!videos.length) {
            return res.status(404).json({ error: null, message: "Videos with given search was not found !" });
        }

        res.status(200).send({
            status: "success",
            message: "Videos fetched by title successfully !",
            data: {
                totalItems: videos.length,
                videos
            }
        });

    } catch (error) {
        console.log("Video Search Error:: ", error.message || error);
        return res.status(500).json({ error: error.message || error, message: "Videos Search:: Internal Server Error !" })
    }
}