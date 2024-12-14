import mongoose, { Schema } from "mongoose";

const likesDislikesSchema = new Schema({
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
    type: {
        type: Boolean, // if like then true, if dislike then false
        required: true
    }
}, { timestamps: true });

const LikesDislikes = mongoose.model('LikesDislikes', likesDislikesSchema);

export default LikesDislikes;