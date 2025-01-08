import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Configure CORS
const corsOptions = {
    origin: "https://vidionix.vercel.app",
    methods: ["GET", "POST", "PATCH", "DELETE"],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.route.js";
import likesDislikesRouter from "./routes/likesdislikes.route.js";
import channelRouter from "./routes/channel.route.js";
import categoryRouter from "./routes/category.route.js";

// Routes 
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes-dislikes", likesDislikesRouter);
app.use("/api/v1/channels", channelRouter);
app.use("/api/v1/categories", categoryRouter);

export { app };