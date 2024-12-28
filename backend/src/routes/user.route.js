import express from "express";
import { loginUser, logoutUser, registerUser, sendAccessToken, getUserById } from "../controllers/user.controller.js";
import { dynamicUpload } from "../middlewares/multer.middleware.js";
import authenticateUser from "../middlewares/authenticate.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", dynamicUpload.single('avatar'), registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/refresh-token/:id", sendAccessToken);
userRouter.post("/logout/:id", authenticateUser, logoutUser);
userRouter.get("/user/:id", authenticateUser, getUserById);

export default userRouter;