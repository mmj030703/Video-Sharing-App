import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
    channel: {
        type: Schema.Types.ObjectId,
        ref: "Channel",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        index: "text"   // defining text index for efficient search functionality
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    videoPublicId: {
        type: String,
        required: true
    },
    duration: {
        type: Number,   // in seconds as per recieved by cloudinary
        required: true,
        default: 0,
        min: [0, 'Duration cannot be negative']
    },
    categories: [
        {
            type: String,
            trim: true,
            lowercase: true,
            index: true
        }
    ],
    tags: [
        {
            type: String,
            trim: true,
            lowercase: true,
            index: true
        }
    ],
    thumbnail: {
        type: String,
        required: true
    },
    thumbnailPublicId: {
        type: String,
        required: true
    }
}, { timestamps: true });

videoSchema.path('categories').validate(function (value) {
    return value && value.length > 0;
}, "Atleast one category should be added !");

videoSchema.path('tags').validate(function (value) {
    return value && value.length > 2;
}, "Atleast three tags should be added !");

const Video = mongoose.model('Video', videoSchema);

export default Video;