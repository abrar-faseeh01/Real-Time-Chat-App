 // here we will create functions that will connect to the database
 
 import mongoose from "mongoose";

 // function to connect to the database
export const connectDB = async()=>{
    try {
        mongoose.connection.on('connected',()=> console.log("Database connected successfully"));
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    } catch (error) {
        console.log(error);
    }
}