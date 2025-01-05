import Comment from "../models/comment.model.js";
import Video from "../models/video.model.js";
import { isValidMongoDBObjectId } from "../utils/validations.js";

export async function addComment(req, res, next) {
    try {
        const { id: videoId } = req.params;
        const { userId, message } = req.body;

        if (!userId) {
            return res.status(400).json({ error: null, message: "User Id not provided !" });
        }

        if (!videoId) {
            return res.status(400).json({ error: null, message: "Video Id not provided !" });
        }

        if (!message || message.trim() === "") {
            return res.status(400).json({ error: null, errorCode: "COMMENT_MESSAGE_MISSING", message: "Message not provided !" });
        }

        if (!isValidMongoDBObjectId(userId) || !isValidMongoDBObjectId(videoId)) {
            return res.status(400).json({ error: null, message: "Invalid Id provided !" });
        }

        const comment = await Comment.create({
            user: userId,
            video: videoId,
            message
        });

        if (!comment) {
            return res.status(400).json({ error: null, errorCode: "ADD_COMMENT_ERROR", message: "An error occurred while creating the comment !" });
        }

        return res.status(201).send({ status: "success", message: "Comment created successfully !", data: comment });

    } catch (error) {
        console.log("Add Comment Error: ", error.message || error);
        return res.status(500).json({
            error: error.message || error,
            errorCode: "ADD_COMMENT_ERROR",
            message: "Add Comment:: Internal Server Error !"
        });
    }
}

export async function updateComment(req, res, next) {
    try {
        const { id: commentId } = req.params;
        const { userId, message } = req.body;

        if (!userId) {
            return res.status(400).json({ error: null, message: "User Id not provided !" });
        }

        if (!commentId) {
            return res.status(400).json({ error: null, message: "Comment Id not provided !" });
        }

        if (!message || message.trim() === "") {
            return res.status(400).json({ error: null, errorCode: "FIELDS_MISSING", message: "Message not provided !" });
        }

        if (!isValidMongoDBObjectId(userId) || !isValidMongoDBObjectId(commentId)) {
            return res.status(400).json({ error: null, message: "Invalid Id provided !" });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: null, message: "Comment not found !" });
        }

        // Validating User
        if (comment.user.toString() !== userId) {
            return res.status(403).json({ error: null, errorCode: "UNAUTHORISED_ERROR", message: "Unauthorised User ! Cannot update this comment." });
        }

        comment.message = message;
        await comment.save();

        return res.status(200).send({ status: "success", message: "Comment updated successfully !", data: comment });

    } catch (error) {
        console.log("Update Comment Error: ", error.message || error);
        return res.status(500).json({
            error: error.message || error,
            errorCode: "UPDATE_COMMENT_ERROR",
            message: "Update Comment:: Internal Server Error !"
        });
    }
}

export async function deleteComment(req, res, next) {
    try {
        const { id: commentId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: null, message: "User Id not provided !" });
        }

        if (!commentId) {
            return res.status(400).json({ error: null, message: "Comment Id not provided !" });
        }

        if (!isValidMongoDBObjectId(userId) || !isValidMongoDBObjectId(commentId)) {
            return res.status(400).json({ error: null, message: "Invalid Id provided !" });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: null, message: "Comment not found !" });
        }

        // Validating User
        if (comment.user.toString() !== userId) {
            return res.status(403).json({ error: null, errorCode: "UNAUTHORISED_ERROR", message: "Unauthorised User ! Cannot delete this comment." });
        }

        await comment.deleteOne();

        return res.status(200).send({ status: "success", message: "Comment deleted successfully !", data: { commentId, userId } });

    } catch (error) {
        console.log("Delete Comment Error: ", error.message || error);
        return res.status(500).json({
            error: error.message || error,
            errorCode: "DELETE_COMMENT_ERROR",
            message: "Delete Comment:: Internal Server Error !"
        });
    }
}

export async function getAllComments(req, res, next) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: null, message: "Id not provided !" });
        }

        if (!isValidMongoDBObjectId(id)) {
            return res.status(400).json({ error: null, message: "Id not valid !" });
        }

        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({ error: null, message: "Video not found!" });
        }

        const comments = await Comment
            .find({ video: id })
            .populate("user", "avatar username")
            .sort("-createdAt");

        res.status(200).send({
            status: "success",
            message: `${comments.length ? "Comments fetched successfully !" : "No comments found for the given video !"}`,
            data: {
                totalItems: comments.length,
                comments
            }
        });

    } catch (error) {
        console.log("Get All Comments Error: ", error.message || error);
        return res.status(500).json({
            error: error.message || error,
            message: "Get All Comments:: Internal Server Error !"
        });
    }
}