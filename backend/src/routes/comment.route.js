import express from "express";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";

const commentRouter = express.Router();

// Routes
commentRouter.post("/add", addComment);
commentRouter.patch("/update", updateComment);
commentRouter.delete("/delete", deleteComment);
commentRouter.get("all/:id", getAllComments);

export default commentRouter;