import mongoose, { Schema } from "mongoose";

const likesDislikesSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    video: {
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

likesDislikesSchema.index({ video: 1, type: 1 });

const LikesDislikes = mongoose.model('LikesDislikes', likesDislikesSchema);

export default LikesDislikes;