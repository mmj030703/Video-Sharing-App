import { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from "../constants/constant.js";
import User from "../models/user.model.js";
import { getOptimizedUrl, uploadToCloudinary } from "../utils/cloudinary.js";
import { doEmptyFieldExist, isEmailValid } from "../utils/validations.js";
import bcrypt from "bcrypt";
import fs from "fs";

// Controller to register user
export async function registerUser(req, res, next) {
    try {
        // Steps to register user

        // access data from req.body
        const { username, email, password } = req.body;
        const avatarObj = req.file;
        let avatarPath = avatarObj.path;

        // validate user data
        if (doEmptyFieldExist(username, email, password)) {
            return res.status(400).json({ error: null, message: "Field should not be empty !" });
        }

        // Check if email is in not the correct format
        if (!isEmailValid(email)) {
            return res.status(400).json({ error: null, message: "Invalid email format !" });
        }

        // Check username or email already exist or not
        const existedUser = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (existedUser) {
            return res.status(400).json({ error: null, message: "User already registered !" });
        }

        // validate user avatar
        if (!req.file || !req.file?.path) {
            return res.status(400).json({ error: null, message: "Avatar should be uploaded !" });
        }

        // Validating avatar for type and size
        if (avatarObj.mimetype.split("/")[0] !== "image") {
            return res.status(400).json({ error: null, message: "Avatar should be an image !" });
        }

        if (avatarObj.size > 2 * 1024 * 1024) {
            return res.status(400).json({ error: null, message: "Avatar file size exceeded !" });
        }

        let avatar = null;
        let avatarOptimisedUrl = null;
        try {
            // upload avatar to cloudinary
            avatar = await uploadToCloudinary(avatarPath);

            avatarOptimisedUrl = getOptimizedUrl(avatar.public_id, avatar.resource_type, 512, 512);
        } catch (error) {
            console.log("Cloudinary User Avatar Upload Error: ", error.message || error);
            return res.status(500).json({ error: error.message || error, message: "Cloudinary User Avatar Upload Error:: Internal Server Error !" });
        }

        // create user 
        const user = await User.create({
            username,
            email,
            password,
            avatar: avatarOptimisedUrl,
            avatarPublicId: avatar.public_id
        });

        // check user created properly
        if (!user) {
            res.status(400).json({ error: null, message: "User Registeration:: An error occurred while creating a user !" });
        }

        // if user created properly send res
        res.status(201).send({ status: "success", message: "User registered successfully !", data: { username: user.username, email: user.email } });
    } catch (error) {
        return res.status(500).json({ error: error, message: "User Registeration:: Internal Server Error !" });
    } finally {
        if (req.file) {
            const avatarPath = req.file.path;
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
        }
    }
}

// Controller to login user
export async function loginUser(req, res, next) {
    try {
        // steps

        // take data from req.body
        const { email, password } = req.body;


        // validate data for emptiness
        if (doEmptyFieldExist(email, password)) {
            return res.status(400).json({ error: null, message: "Field should not be empty !" });
        }


        // validate email
        if (!isEmailValid(email)) {
            return res.status(400).json({ error: null, message: "Invalid email format !" });
        }

        // check for existing user
        const existingUser = await User.findOne({ email });

        // if not registered then return error res as not registered
        if (!existingUser) {
            return res.status(404).json({ error: null, message: "User is not registered !" });
        }

        // if registered then - check for password matching
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: null, message: "Password is invalid !" });
        }

        const userData = {
            username: existingUser.username,
            email: existingUser.email
        }

        // jwt token generate
        const accessToken = existingUser.generateJwtToken(userData, ACCESS_TOKEN_EXPIRATION);
        const refreshToken = existingUser.generateJwtToken(userData, REFRESH_TOKEN_EXPIRATION);

        existingUser.refreshToken = refreshToken;
        await existingUser.save();

        // return res with token
        res
            .status(200)
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' })
            .send({
                status: "success",
                message: "User loggedin successfully !",
                data: {
                    ...userData,
                    accessToken
                }
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error, message: "Internal Server Error !" });
    }
}

// Controller to send new access token 
export async function sendAccessToken(req, res, next) {
    try {
        const refreshToken = req.cookies.refreshToken;
        const { userId } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error, message: "Refresh token is not found !" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error, message: "User does not exist !" });
        }

        try {
            const isRefreshTokenValid = user.verifyRefreshToken(refreshToken);

            if (!isRefreshTokenValid) {
                return res.status(403).json({ error: error, message: "Invalid refresh token." });
            }
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(403).json({ error: error, message: "Refresh token expired. Please log in again." });
            }
            return res.status(403).json({ error: error, message: "Invalid refresh token." });
        }

        const userData = { username: user.username, email: user.email };
        const accessToken = user.generateJwtToken(userData, ACCESS_TOKEN_EXPIRATION);

        res.status(200).send({ status: "success", message: "Access token generated successfully.", data: { ...userData, accessToken } });
    } catch (error) {
        return res.status(500).json({ error, message: "Send Access Token:: Internal Server Error !" });
    }
}

export async function logoutUser(req, res, next) {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: null, message: "User not found !" });
        }

        user.refreshToken = null;
        await user.save();

        res
            .status(200)
            .cookie("refreshToken", "", {
                expires: new Date(0),
                httpOnly: true,
                secure: true,
                sameSite: "Strict"
            })
            .send({ status: "success", message: "User logged out successfully." })
    } catch (error) {
        return res.status(500).json({ error: error, message: "Logout:: Internal Server Error !" });
    }
}