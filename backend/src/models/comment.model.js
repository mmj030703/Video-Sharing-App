import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, "Message cannot exceed 500 characters!"]
    }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;