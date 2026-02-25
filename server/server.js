import cors from 'cors';
import "dotenv/config.js";
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './lib/db.js';
import messageRouter from './routes/messageRoutes.js';
import userRouter from './routes/userRoutes.js';

// Create Express app and HTTP server
const app = express();
const server= http.createServer(app)

// Initialize Socket.IO server
export const io = new Server(server, {
    cors:{origin:"*"}
})

// store online users
export const userSocketMap = {}; // {userId: socketId}

// Socket.IO connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId; // Get userId from the frontend when the socket connection is established
    console.log("User connected: ", userId);

    if(userId){
        userSocketMap[userId] = socket.id; // Map userId to socketId. user x is connected via socket y. 
    }
    // Emit online users to all connected clients.Server sends the list of currently online users to everyone who is connected.
    io.emit("getOnlineUsers", Object.keys(userSocketMap)) // You want to know which users are online. You don’t care about socket IDs on the frontend

    socket.on("disconnect",()=>{
        console.log("User disconnected: ", userId);
        delete userSocketMap[userId]; // Remove user from online users map
        io.emit("getOnlineUsers", Object.keys(userSocketMap)) // Update online users for all clients
    })
} )

// Middleware setup
app.use(cors())
app.use(express.json({limit: "4mb"}));

// Route setup
app.use("/api/status",(req,res)=> res.send("Server is live"))
app.use("/api/auth",userRouter) // All routes related to user authentication and profile management are handled by userRouter. This includes routes for login, registration, profile updates, etc.
app.use("/api/messages", messageRouter) // All routes related to messaging are handled by messageRouter. This includes routes for sending messages, retrieving message history, etc. 


// Connect to the database
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>console.log("Server is running on PORT: "+PORT))