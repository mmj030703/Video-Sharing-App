import View from "../models/view.model.js";
import { doEmptyFieldExist, isValidMongoDBObjectId } from "../utils/validations.js";

export async function updateVideoViews(req, res, next) {
    try {
        const { id: videoId } = req.params;
        const { userId, userRegistered } = req.body;

        // Validations
        if (userRegistered && !userId) {
            return res.status(400).json({ error: null, message: "UserId not provided !" });
        }

        if (!videoId) {
            return res.status(400).json({ error: null, message: "VideoId not provided!" });
        }

        if ((userRegistered && !isValidMongoDBObjectId(userId)) || !isValidMongoDBObjectId(videoId)) {
            return res.status(400).json({ error: null, message: "Invalid id provided !" });
        }

        let maxRetries = 3;
        let timesTried = 0;
        let success = false;

        while (timesTried < maxRetries) {
            try {
                const view = await View.create({
                    user: userRegistered ? userId : null,
                    video: videoId
                });

                console.log("Views for video updated !");
                success = true;
                break;

            } catch (error) {
                timesTried++;
                console.log(`Retry ${timesTried}: `, error.message || error);

                if (timesTried === maxRetries) {
                    console.log("View updation for video failed: ", error.message || error);
                }
            }
        }

        next();  // irrespective of success or failure we go ahead after retrying at max 3 times

    } catch (error) {
        console.log("Update Video Views:: Internal Server Error! ", error.message || error);
        next();
    }
}