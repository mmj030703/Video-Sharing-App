import Comment from "../models/comment.model.js";
import LikesDislikes from "../models/likedislike.model.js";
import Video from "../models/video.model.js";
import View from "../models/view.model.js";
import { isValidMongoDBObjectId } from "../utils/validations.js";

export async function getAllVideosByCategory(req, res, next) {
    try {
        let { category } = req.params;

        if (!category || category.trim() === "") {
            return res.status(400).json({ error: null, message: "Category is required !" });
        }

        category = category.trim().toLowerCase();

        if (category !== "all" && !isValidMongoDBObjectId(category)) {
            return res.status(400).json({ error: null, message: "Invalid id provided !" });
        }

        let videos;

        if (category === "all") {
            videos = await Video.find()
                .populate("channel", "title avatar")
                .select("-description -videoUrl -videoPublicId -categories -tags -thumbnailPublicId");
        } else {
            videos = await Video.find({ categories: { $in: [category] } })
                .populate("channel", "title avatar")
                .select("-description -videoUrl -videoPublicId -categories -tags -thumbnailPublicId");
        }

        res.status(200).send({ status: "success", message: "Videos fetched successfully !", data: { category, totalItems: videos.length, videos } });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Get all videos:: Internal Server Error !" });
    }
}

export async function getVideoById(req, res, next) {
    try {
        const { id } = req.params;
        console.log("params: ", id);


        if (!id || typeof id !== "string" || !isValidMongoDBObjectId(id)) {
            return res.status(400).json({ error: null, message: "Invalid video id !" });
        }

        const video = await Video
            .findById(id)
            .populate("channel", "title avatar")
            .populate("categories")
            .select("-tags -thumbnail -thumbnailPublicId -videoPublicId");

        if (!video) {
            return res.status(404).json({ error: null, message: "No video found !" });
        }

        // Parallely fetching likes, comments, recommendedVideos to optimise time        
        const [likes, views] = await Promise.all([
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

        const videos = await Video
            .find({ channel: channelId })
            .populate("channel", "title avatar")
            .select("-videoUrl -videoPublicId -categories -tags -thumbnailPublicId");

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

export async function getVideosByTitle(req, res, next) {
    try {
        const { query: title } = req.query;

        if (!title || title.trim() === "") {
            return res.status(400).json({ error: null, message: "Input is empty !" })
        }

        const videos = await Video
            .find({
                $text: { $search: title } // $search will check each word in the title and try to find whether it is available in the title field or not and the search is efficient and case-insensitive
            })
            .populate("channel", "title avatar")
            .select("-videoUrl -videoPublicId -categories -tags -thumbnailPublicId")
            .limit(10)
            .sort({ score: { $meta: "textScore" } });  // Sort by text match relevance

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