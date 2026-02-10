import express from 'express';
import { checkAuth, login, signup, updateProfile } from '../controller/userController';
import { protectRoute } from '../middleware/auth';

const userRouter= express.Router();

userRouter.get('/signup',signup)
userRouter.get('/login',login)
userRouter.get('/check',protectRoute,checkAuth)
userRouter.put('/update-profile',protectRoute,updateProfile)

export default userRouter;
