// Importing config files for making environment variables available to all the files
import "./config/config.js";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";

const port = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log("Server created successfully and listening to port", port);
        });
    })
    .catch(error => {
        console.log("An error occurred while creating database !", error);
    });