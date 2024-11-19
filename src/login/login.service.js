const jwt = require('jsonwebtoken');
const loginModule = require('../login/login.module');
const bcrypt = require('bcrypt');
const utils = require('../utils/utils');
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const loginUser = async ({ email, password }) => {
   
    const user = await loginModule.findUserByEmail(email);
    if (!user) {
        throw new Error('User not found, Please check your email or sign up.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Incorrect password, Please check your password and try again.');
    }

    let customer_id = null;
    let mitra_id = null;

    if (user.role_id == 1) {
        const customer = await loginModule.findCustomerByUserId(user.user_id);
        if (customer) {
            customer_id = customer.customer_id;
        }
    } else if (user.role_id == 2) {
        const mitra = await loginModule.findMitraByUserId(user.user_id);
        if (mitra) {
            mitra_id = mitra.mitra_id;
        }
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

    const responseData = {
        token,
        userId: user.user_id,
        name: user.name,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        customer_id,
        mitra_id,
        createdAt: user.createdAt
     };

     const responseLogin = utils.removeNullProperties(responseData);
     return responseLogin
    
};

module.exports = { loginUser };
