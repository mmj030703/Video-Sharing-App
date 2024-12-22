import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Email is invalid !"
        ],
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/mmj030703/image/upload/v1734079310/default%20user.png"
    },
    avatarPublicId: {
        type: String
    },
    refreshToken: {
        type: String,
        default: null
    }
}, { timestamps: true });


// user methods
userSchema.methods.generateJwtToken = function (data, expiration) {
    return jwt.sign(data, process.env.JWT_SECRET_KEY, {
        expiresIn: expiration
    });
}

userSchema.methods.verifyRefreshToken = function (token) {
    if (this.refreshToken !== token) {
        return false;
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
        throw error;
    }
}

userSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model("User", userSchema);

export default User;