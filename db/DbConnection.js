import mongoose from "mongoose";
import { DB_NAME } from '../constant.js';

export const DbConnection = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Connected to MongoDB database: ${DB_NAME}`);
    } catch (error) {
        console.log("MONGODB connection FAILED", error);
        process.exit(1);
    }
};