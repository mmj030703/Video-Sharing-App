import express from "express";
import { loginUser, logoutUser, registerUser, sendAccessToken } from "../controllers/user.controller.js";
import { imageUpload } from "../middlewares/multer.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", imageUpload.single('avatar'), registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/refresh-token", sendAccessToken);
userRouter.post("/logout", logoutUser);

export default userRouter;