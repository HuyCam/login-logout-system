const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        unique: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error('Invalid email');
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.methods.generateToken = async function() {
    const user = this;

    const token = await jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);
    user.tokens.push({token});

    await user.save();

    return token;
}

userSchema.pre('save', async function(next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})


userSchema.methods.toJSON = function() {
    const user = this;

    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;

    return userObj;
}

const User = mongoose.model('User', userSchema);

module.exports = User;