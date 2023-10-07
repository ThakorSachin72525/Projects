import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken'
const isLoggedIn = async (req,res,next) => {
    const { token } = req.cookies;

    if(!token){
        return next(new AppError('Unauthenticated, Please login again', 401))
    }

    const userDetails = await jwt.verify(token, process.env.JWT_SECRET)

    req.user = userDetails;
    next();
}

const authorizedRoles = (...roles) => (req,res,next) => {
    const currecntUserRoles = req.user.role

    if(!roles.includes(currecntUserRoles)){
        return next(
            new AppError("You don't have permission to perform this action", 403)
        )
    }
    next()
}


export {
    isLoggedIn,
    authorizedRoles
}