import mongoose, { Schema } from "mongoose";

const channelSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    handle: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    coverImage: {
        type: String,
        required: true
    },
    coverImagePublicId: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    avatarPublicId: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Channel = mongoose.model("Channel", channelSchema);

export default Channel;