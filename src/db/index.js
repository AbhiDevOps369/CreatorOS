import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export const connectDb = async () => {
    await mongoose.connect(process.env.MONGO_URI)
}