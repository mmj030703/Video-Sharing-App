import express from "express";
import { addCategory, getAllCategories } from "../controllers/category.controller.js";

const categoryRouter = express.Router();

// Routes
categoryRouter.get("/videos/all", getAllCategories); // takes associatedWith query parameter where we can tell which categories we want like for videos or posts or shorts as in this project as of now we deal with only video
categoryRouter.post("/add", addCategory);

export default categoryRouter;