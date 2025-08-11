import express from 'express'
import { isAuthentication, login, logout, register, sendVerifyOtp, verifyEmail } from '../controller/userController.js';
import { userAuth } from '../middleware/userAuth.js';

let authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth , sendVerifyOtp);
authRouter.post('/verify-account', userAuth , verifyEmail);
authRouter.post('/is-auth', userAuth , isAuthentication);

export default authRouter;