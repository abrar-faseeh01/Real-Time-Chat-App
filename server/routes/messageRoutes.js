import express from "express";
import { getMessages, getUsersForSidebar, markMessageAsSeen } from "../controller/messageController.js";
import { protectRoute } from "../middleware/auth.js";



const messageRouter = express.Router()

messageRouter.get("/users",protectRoute,getUsersForSidebar)
messageRouter.get("/:id",protectRoute,getMessages)
messageRouter.put("mark/:id",protectRoute,markMessageAsSeen)

export default messageRouter;