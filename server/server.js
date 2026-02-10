import cors from 'cors';
import "dotenv/config.js";
import express from 'express';
import http from 'http';
import { connectDB } from './lib/db.js';
import messageRouter from './routes/messageRoutes.js';
import userRouter from './routes/userRoutes.js';

// Create Express app and HTTP server
const app = express();
const server= http.createServer(app)

// Middleware setup
app.use(cors())
app.use(express.json({limit: "4mb"}));

// Route setup
app.use("/api/status",(req,res)=> res.send("Server is live"))
app.use("/api/auth",userRouter)
app.use("/api/messages", messageRouter)


// Connect to the database
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>console.log("Server is running on PORT: "+PORT))