import mongoose from "mongoose";

export async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}/${process.env.DATABASE_NAME}`);
        if (connectionInstance) {
            console.log("Database Connected Successfully.");
        }
    } catch (error) {
        console.log("DB Error: ", error);
        process.exit(1);
    }
}