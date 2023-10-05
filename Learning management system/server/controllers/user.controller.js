
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary"
import fs from "fs"
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto"

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

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('All fields are required', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new AppError('User not found', 401)); // Return 401 Unauthorized in case user not found
        }

        console.log('User:', user);

        if (!(await user.comparePassword(password))) {
            return next(new AppError('Email or Password do not match', 401));
        }

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'User login successfully',
            user,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};



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

    // check resetPasswordURL is working or not 

    console.log(resetToken);
    console.log(resetPasswordURL);
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

const resetPassword = async (req,res, next) => {
    const { resetToken } = req.params

    const { password } = req.body;

    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now()}
    })

    if(!user) {
        return next(new AppError('Invalid or expired token', 400))
    }

    user.password = password

    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    
    user.save()

    res.status(200).json({
        success:true,
        message:'Password reset successfully!'
    })
}

const changePassword = async (req,res,next) => {
    const { oldPassword, newPassword } = req.body
    const { id } = req.user

    if(!oldPassword || !newPassword) {
        return next(new AppError('All fields are mendatory', 400))
    }

    const user = await User.findById(id).select('+password')

    if(!user){
        return next(new AppError('User dose not exist', 400))
    }

    const isPasswordValid = await user.comparePassword(oldPassword)

    if(!isPasswordValid) {
        return next(new AppError('Old password is incorrect', 400))
    }

    user.password = newPassword

    await user.save()

    user.password = undefined

    res.status(200).json({
        success:true,
        message:'Password changed successfully!'
    })
}

const updateUser = async (req,res,next) => {
    const { fullName } = req.body
    const { id } = req.user.id

    const user = await User.findById(id)

    if (!user) {
        return next(new AppError('Invalid user id or user does not exist'));
      }

    if (fullName) {
    user.fullName = fullName;
    }

    if (req.file) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id)
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
                new AppError(e.message || 'File not uploaded, plase try again', 400)
            )
        }
    }

    await user.save()

    res.status(200).json({
        success:true,
        message:'User profile updated successfully!'
    })

}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}
