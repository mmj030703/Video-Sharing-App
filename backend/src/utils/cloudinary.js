import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// Function to upload and optimize files to Cloudinary
export async function uploadToCloudinary(fileLocalPath) {
    try {
        const uploadResult = await cloudinary.uploader.upload(fileLocalPath, {
            resource_type: 'auto',
            folder: "uploads/vidionix", // Organize files under 'uploads' folder in Cloudinary
            transformation: [
                { quality: "auto:good" },    // Optimize quality automatically
                { fetch_format: "auto" },    // Deliver in an optimal format (e.g., WebP, AVIF)
            ],
            use_filename: true,             // Use the original file name
            unique_filename: false,         // Prevent random renaming
            video_codec: 'auto',       // Let Cloudinary automatically choose the best video codec
            max_file_size: 50000000
        });

        console.log("Upload Result:", uploadResult);
        fs.unlinkSync(fileLocalPath);
        // Return the secure URL of the uploaded file
        return uploadResult;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message || error);
        fs.unlinkSync(fileLocalPath);
        process.exit(1);
    }
}

// Function to generate optimized image/video URLs
export function getOptimizedUrl(publicId, resourceType, width = 720, height = 405) {
    if (resourceType === 'video') {
        return cloudinary.url(publicId, {
            resource_type: resourceType,
            quality: "auto:good",
            fetch_format: "auto",
            width: width,
            height: height,
            crop: "limit",
            video_codec: 'auto'
        });
    } else {
        return cloudinary.url(publicId, {
            resource_type: resourceType,
            quality: "auto:good",
            fetch_format: "auto",
            width: width,
            height: height,
            crop: "limit"
        });
    }
}

export const deleteMultipleMedia = async (publicIds) => {
    try {
        const response = await cloudinary.api.delete_resources(publicIds);
        console.log('Delete Response:', response);
    } catch (error) {
        console.error('Error deleting media:', error);
    }
};