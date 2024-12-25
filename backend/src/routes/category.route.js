import express from "express";
import { addCategory, getAllCategories } from "../controllers/category.controller.js";

const categoryRouter = express.Router();

// Routes
categoryRouter.post("/videos/all", getAllCategories);
categoryRouter.post("/add", addCategory);

export default categoryRouter;