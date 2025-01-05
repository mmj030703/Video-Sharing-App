import express from "express";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";
import authenticateUser from "../middlewares/authenticate.middleware.js";

const commentRouter = express.Router();

// Routes
commentRouter.post("/add/:id", authenticateUser, addComment); // :id is videoId
commentRouter.patch("/update/:id", authenticateUser, updateComment);
commentRouter.delete("/delete/:id", authenticateUser, deleteComment);
commentRouter.get("/all/:id", getAllComments); // :id is videoId

export default commentRouter;