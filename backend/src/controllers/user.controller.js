import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// Controller to register user
export async function registerUser(req, res, next) {
    try {
        // Steps to register user

        // access data from req.body
        const { username, email, password } = req.body;
        let avatarPath = null;

        // validate user data
        if ([username, email, password].some((value) => value.trim() === "")) {
            return res.status(400).json({ error: null, message: "Field should not be empty !" });
        }

        // Check username or email already exist or not


        // validate user avatar
        if (!req.file && !req.file?.path) {
            return res.status(400).json({ error: null, message: "Avatar should be uploaded !" });
        }

        avatarPath = req.file.path;

        // upload avatar to cloudinary
        const avatar = await uploadToCloudinary(avatarPath);

        // username or email already exists
        // create user 
        // check user created properly
        // if user created properly send res
    } catch (error) {
        res.status(500).json({ error: error, message: "User Registeration:: Internal Server Error !" });
    }
}