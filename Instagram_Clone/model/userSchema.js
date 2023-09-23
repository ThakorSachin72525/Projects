const mongoose = require('mongoose')
const JWT = require('jsonwebtoken')
const { Schema } = mongoose
const bcrypt = require('bcrypt')

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'User name is Required'],
        minLength: [2, 'Name must be at least 2 char'],
        maxLength: [50, 'Name must be less than 50 char'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'User email is Required'],
        unique: true,
        lowercase: true,
        unique: [true, 'User already registerd']

    },
    password: {
        type: String,
        select: false
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordExpiryDate: {
        type: Date,
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function(next){
    if (!this.isModified('password') ) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    return next()
})

userSchema.methods = {
    jwtToken() {
        return JWT.sign(
            {id: this._id, email: this.email},
            process.env.SECRET,
            { expiresIn: '24h'}
        )
    }
}


const userModel = mongoose.model('user', userSchema)
module.exports = userModel