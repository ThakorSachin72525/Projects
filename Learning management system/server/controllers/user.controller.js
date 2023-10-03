
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary"
import fs from "fs"
import sendEmail from "../utils/sendEmail.js";

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: true
}
const register = async (req,res, next) => {
    const { fullName, email, password } = req.body;

    if(!fullName || !email || !password) {
        return next(new AppError('All fields are required', 400))
    }

    const userExists = await User.findOne({ email })

    if (userExists) {
        return next(new AppError('Email already exists', 400))
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url:'https://img.freepik.com/free-vector/handsome-man_1308-85984.jpg?size=626&ext=jpg&ga=GA1.2.1046299822.1696240335&semt=ais'
        }
    })

    if(!user) {
        return next(new AppError('User registration failed, plase try again', 400))
    }

    console.log("File Details --> ", JSON.stringify(req.file));
    if (req.file) {
        try{
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'face',
                crop: 'fill'
            })

            if(result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                // Remove file from server
                fs.rmSync(`uploads/${req.file.filename}`)

            }
        } catch(e) {
            return next(
                new AppError(e.message || 'File not uploaded, plase try again')
            )
        }
    }

    await user.save()

    user.password = undefined;

    const token = await user.generateJWTToken()

    res.cookie('token', token, cookieOptions)
    

    res.status(201).json({
        success: true,
        message: 'User registration successful',
        user,
    })

}

const login = async (req,res, next) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return next(new AppError('All fields are required', 400))
        }
    
        const user = await User.findOne({ email }).select('+password')
    
        if(!user || !user.comparePassword(password)) {
            return next(new AppError('Email or password is incorrect', 401))
        }
    
        const token = await user.generateJWTToken()
        user.password = undefined;
    
        res.cookie('token', token, cookieOptions)
    
        res.status(200).json({
            success: true,
            message: 'User login successfully',
            user,
        })
    } catch(e){
        return next(new AppError(e.message, 500))
    
    }

}

const logout = (req,res) => {
    res.cookie('token',null,{
        secure:true,
        maxAge:0,
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message:'User logged out successfully'
    })
}
const getProfile = async (req,res,next) => {
    try{
        const userId = req.user.id
        const user = await User.findById(userId)

        res.status(200).json({
            success:true,
            message:'User profile fetched successfully',
            user
        })
    } catch(e){
        return next(new AppError('Failed to fetch profile detail'))
    }
}

const forgotPassword = async (req,res,next) => {
    const { email } = req.body;

    if(!email) {
        return next(new AppError('Email is required', 400))
    
    }

    const user = await User.findOne({ email })
    if(!user) {
        return next(new AppError('User not found', 400))
    }

    const resetToken = await user.generatePasswordResetToken()

    await user.save()

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;

    try {
        await sendEmail(email, subject, message)
        res.status(200).json({
            success:true,
            message:`Reset password link sent to your email ${email} successfully`
        })
    } catch(e) {
        user.forgotPasswordExpiry = undefined
        user.forgotPasswordToken = undefined

        console.error('Error sending email:', e);
        await user.save()
        return next(
            new AppError(
              e.message || 'Something went wrong, please try again.',
              500
            )
          );
    }
}

const resetPassowrd = (req,res) => {

}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassowrd
}
