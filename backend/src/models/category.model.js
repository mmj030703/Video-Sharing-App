import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    associatedWith: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;