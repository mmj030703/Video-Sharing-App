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

        ////////////////////////////////////////////////////////
        const url = `https://video-sharing-app-2n9p.onrender.com/api/v1/videos/reload`; // Replace with your Render URL
        const interval = 30000; // Interval in milliseconds (30 seconds)

        //Reloader Function
        function reloadWebsite() {
            fetch(url)
                .then(response => {
                    console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
                })
                .catch(error => {
                    console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
                });
        }

        setInterval(reloadWebsite, interval);
    })
    .catch(error => {
        console.log("An error occurred while creating database !", error);
    });