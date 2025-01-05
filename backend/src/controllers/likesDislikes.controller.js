import LikesDislikes from "../models/likedislike.model.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import { isValidMongoDBObjectId } from "../utils/validations.js";

export async function updateLikesDislikes(req, res, next) {
    try {
        const { id: videoId } = req.params;
        const { userId, type, operation, alreadyLiked, alreadyDisliked } = req.body;

        if (!isValidMongoDBObjectId(userId) ||
            !isValidMongoDBObjectId(videoId) ||
            typeof type !== "boolean" ||
            !operation ||
            typeof operation !== "string" ||
            !["add", "remove"].includes(operation) ||
            typeof alreadyLiked !== "boolean" ||
            typeof alreadyDisliked !== "boolean"
        ) {
            return res.status(400).json({ error: null, message: "Invalid input data !" });
        }

        let data;

        if (operation === "add") {
            if (type === true && alreadyDisliked) {
                await LikesDislikes.deleteOne({ user: userId, video: videoId, type: false });
            }
            if (type === false && alreadyLiked) {
                await LikesDislikes.deleteOne({ user: userId, video: videoId, type: true });
            }

            if ((type === true && alreadyLiked) || (type === false && alreadyDisliked)) {
                return res.status(400).json({ error: null, message: `Content is already ${type === true ? 'liked' : 'disliked'} !` });
            }

            data = await LikesDislikes.create({
                user: userId,
                video: videoId,
                type
            });
        } else if (operation === "remove") {
            data = await LikesDislikes.deleteOne({ user: userId, video: videoId, type });
        }

        if (!data) {
            return res.status(400).json({ error: null, errorCode: "LIKE_DISLIKE_UPDATE_ERROR", message: "An error occurred while updating likes and dislikes !" });
        }

        res.status(200).send({ status: "success", message: "Operation performed successfully !", data: { operation, type, data } });
    } catch (error) {
        console.log("Update Likes & Dislikes:", error);
        return res.status(500).json({
            error: error.message || error,
            errorCode: "LIKE_DISLIKE_UPDATE_ERROR",
            message: "Update Likes & Dislikes:: Internal Server Error !"
        });
    }
}

export async function getLikesByVideoId(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: null, message: "Video Id not provided !" });
        }

        if (!isValidMongoDBObjectId(id)) {
            return res.status(400).json({ error: null, message: "Invalid Video Id provided !" });
        }

        const video = await Video.findById(id).select("_id");

        if (!video) {
            return res.status(404).json({ error: null, message: "Video with the given id not found !" });
        }

        const likes = await LikesDislikes.countDocuments({ video: id, type: true });

        res.status(200).send({ status: "success", message: "Likes fetched successfully !", data: { likesCount: likes } });
    } catch (error) {
        console.log("Get Likes By Video Id:", error);
        return res.status(500).json({
            error: error.message || error,
            message: "Get Likes By Video Id:: Internal Server Error !"
        });
    }
}

export async function getLikesDislikesStatusOfLoggedInUser(req, res, next) {
    try {
        const { id: videoId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: null, message: "User Id not provided !" });
        }

        if (!videoId) {
            return res.status(400).json({ error: null, message: "Video Id not provided !" });
        }

        if (!isValidMongoDBObjectId(userId) || !isValidMongoDBObjectId(videoId)) {
            return res.status(400).json({ error: null, message: "Invalid Id provided !" });
        }

        const [video, user] = await Promise.all([
            Video.findById(videoId).select("_id"),
            User.findById(userId).select("_id")
        ]);

        if (!video) {
            return res.status(404).json({ error: null, message: "Video with the given id not found !" });
        }

        if (!user) {
            return res.status(404).json({ error: null, message: "User with the given id not found !" });
        }

        const likeDislike = await LikesDislikes.findOne({ video: videoId, user: userId });

        res.status(200).send({ status: "success", message: "Like Status recieved successfully !", data: { userLikedDisliked: likeDislike ? true : false, type: likeDislike ? likeDislike.type : null } });
    } catch (error) {
        console.log("Likes Dislikes Status of LoggedIn User Error:", error);
        return res.status(500).json({
            error: error.message || error,
            message: "Likes Dislikes Status of LoggedIn User:: Internal Server Error !"
        });
    }
}