import userModel from "../models/userModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from "../config/nodemailer.js"
import dotenv from 'dotenv'

dotenv.config()

export const register = async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' })
    }

    try {
        let existUser = await userModel.findOne({ email });
        if (existUser) {
            return res.json({ success: false, message: 'User Already Exist' })
        }
        const hashPassword = await bcrypt.hash(password, 10)

        const user = await new userModel({
            name, email, password: hashPassword
        })

        await user.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'production',
            sameSite: process.env.NODE_ENV == 'production' ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: `Welcome to Hamza website`,
            text: `Welcome to hamza website .Your account has been created with email id : ${email}`
        }

        await transporter.sendMail(mailOptions)
        return res.send({ success: true, message: "Signup Successfully" })


    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Invalid Email" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: "Wrong Password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'production',
            sameSite: process.env.NODE_ENV == 'production' ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })



        return res.send({ success: true, message: "Login Successfully" })
    } catch (error) {
        console.log(error.message);
        return res.send({ success: false, message: error.message })

    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'production',
            sameSite: process.env.NODE_ENV == 'production' ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.send({ success: true, message: "logout Successfully" })
    } catch (error) {
        console.log(error.message);
        return res.send({ success: true, message: error.message })
    }
}


// send opt for verification

export const sendVerifyOtp = async () => {
    try {
        const { userId } = req.body

        const user = userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.send({ success: true, message: "Account Verify" })
        }
        const otp = String(100000 + Math.random() * 900000)
        user.verifyOTP = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: `Account Verification OTP`,
            text: `Your OTP is ${otp} . Verify your account using this OTP`
        }

        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: `Verification OTP Send to email` })
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })

    }

}


export const verifyEmail = async (req,res)=>{
    const {userId , otp} = req.body

    if (!userId || !otp) {
        return res.json({ success : false , message : 'Detail Missing'})        
    }

    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return res.json({ success : false , message : "User not found"})            
        }

        if (user.verifyOTP === '' || user.verifyOTP !== otp) {
            return res.send({success : false , message : "Invalid OTP"})            
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({
                success : false , 
                message : "OTP Expired"
            })            
        }

        user.isAccountVerified = true
        user.verifyOTP = ''
        user.verifyOtpExpireAt = 0

        await user.save()
        return res.json({success : true , message : 'Email Verification Successfully'})


    } catch (error) {
        console.log(error.message); 
        res.json({success : false , message : error.message})
        
    }
}