// we'll be using this middleware to protect routes that require authentication
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req,res,next)=>{
    try {
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        
        if(!user){
            return res.json({success: false, message: "User not found"});
        }

        req.user=user; // attach user data to request object for use in next middleware or route handler
        next(); // proceed to the next middleware or route handler

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}