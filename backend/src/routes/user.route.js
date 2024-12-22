import express from "express";
import { loginUser, logoutUser, registerUser, sendAccessToken } from "../controllers/user.controller.js";
import { dynamicUpload } from "../middlewares/multer.middleware.js";
import authenticateUser from "../middlewares/authenticate.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", dynamicUpload.single('avatar'), registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/refresh-token", authenticateUser, sendAccessToken);
userRouter.post("/logout", authenticateUser, logoutUser);

export default userRouter;