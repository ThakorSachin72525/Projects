import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";

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

    // TODO: File upload

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

    res.status(200).jsom({
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

export {
    register,
    login,
    logout,
    getProfile
}
