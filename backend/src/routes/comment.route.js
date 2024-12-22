import express from "express";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";
import authenticateUser from "../middlewares/authenticate.middleware.js";

const commentRouter = express.Router();

// Routes
commentRouter.post("/add", authenticateUser, addComment);
commentRouter.patch("/update", authenticateUser, updateComment);
commentRouter.delete("/delete", authenticateUser, deleteComment);
commentRouter.get("all/:id", getAllComments);

export default commentRouter;