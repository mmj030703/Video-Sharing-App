import mongoose, { Schema } from "mongoose";

const viewSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true
    },
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
        index: true
    },
    guestId: {
        type: String,
        default: null,
        unique: true
    }
}, { timestamps: true });

const View = mongoose.model('View', viewSchema);

export default View;