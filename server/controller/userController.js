// all the functions related to user operations will be defined here

import { generateToken } from "../lib/utils";
import User from "../models/User";

// Signup a new user
export const signup = async(req, res)=>{
    try {
        const{email, fullName, password} = req.body;
        if(!email || !fullName || !password){
            return res.json({success: false, message: "All fields are required"})
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.json({success: false, message: "User already exists with this email"})
        }

        // another way to hash password
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password,salt)
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({email, fullName, password: hashedPassword});

        // create token to authenticate user
         const token = generateToken(newUser._id);

         res.json({success: true, userData: newUser, token, message: "User registered successfully"});
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message});
        
    }  
}

// controller function to login user 
export const login = async (req,res)=>{
    try {
      const {email, password}= req.body;
      const userData = await User.findOne({email});

      const isPasswordCorrect = await bcrypt.compare(password, userData.password);

      if(!isPasswordCorrect){
        return res.json({success: false, message: "Invalid credentials"})
      }

      const token = generateToken(userData._id);
      res.json({success: true, userData, token, message: "User logged in successfully"})
    
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});        
    }    
    
    }