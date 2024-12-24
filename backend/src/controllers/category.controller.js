import Category from "../models/category.model.js";
import Video from "../models/video.model.js";

export async function getAllCategories(req, res, next) {
    try {
        let { associatedWith } = req.body;

        if (!associatedWith || associatedWith.trim() === "") {
            return res.status(400).json({
                error: null,
                message: "Associated With Field is Required"
            });
        }

        associatedWith = associatedWith.toLowerCase();

        const categories = await Video.find({ associatedWith });

        res
            .status(200)
            .send({
                status: "Success",
                message: "All Categories Fetched Successfully",
                data: categories
            });

    } catch (error) {
        console.log("Get Video All Categories Error:", error.message || error);
        return res
            .status(500)
            .json({
                error: error.message || error,
                message: "Get Video All Categories Error:: Internal Server Error"
            });
    }
}

export async function addCategory(req, res, next) {
    try {
        const { name, associatedWith } = req.body;

        if (!name || !associatedWith || name.trim() === "" || associatedWith.trim() === "") {
            return res.status(400).json({
                error: null,
                message: "Name and Associated with both fields are required !"
            });
        }


        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({
                error: null,
                message: "Category already exists !"
            });
        }

        const category = await Category.create({
            name,
            associatedWith
        });

        if (!category) {
            return res.status(400).json({
                error: null,
                message: "An error occurred while adding category !"
            });
        }

        res
            .status(201)
            .send({
                status: "Success",
                message: "New Category Created !",
                data: category
            });

    } catch (error) {
        console.log("Adding Category Error:", error.message || error);
        return res
            .status(500)
            .json({
                error: error.message || error,
                message: "Adding Category Error:: Internal Server Error"
            });
    }
}