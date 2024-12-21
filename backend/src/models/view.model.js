import mongoose, { Schema } from "mongoose";

const viewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
        index: true
    },
    guestId: {
        type: String,
        default: null
    }
}, { timestamps: true });

const View = mongoose.model('View', viewSchema);

export default View;