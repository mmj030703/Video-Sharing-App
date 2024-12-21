import express from "express";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.route.js";
import likesDislikesRouter from "./routes/likesdislikes.route.js";
import channelRouter from "./routes/channel.route.js";

// Routes 
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes-dislikes", likesDislikesRouter);
app.use("/api/v1/channels", channelRouter);

export { app };