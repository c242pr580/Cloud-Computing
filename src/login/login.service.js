const jwt = require('jsonwebtoken');
const userModule = require('../login/login.module');
const bcrypt = require('bcrypt');
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const loginUser = async ({ email, password }) => {
   
    const user = await userModule.findUserByEmail(email);
    if (!user) {
        throw new Error('User Not Found, Please check your email or sign up.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Incorrect password, Please check your password and try again.');
    }

    const token = jwt.sign(
        { 
            userId: user.user_id,
            role: user.role_id
        }, 
        JWT_SECRET, 
        { 
            algorithm: 'HS256',
            expiresIn: JWT_EXPIRES_IN 
        }
    );

    return {
        token,
        userId: user.user_id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role_id };
};

module.exports = { loginUser };
