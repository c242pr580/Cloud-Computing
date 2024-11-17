const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userModule = require('../register/register.module');

const registerUser = async (userData) => {
    const { username, email, password, location, name, phone } = userData;

    let role_id = parseInt(userData.role_id, 10);

    if (![1, 2].includes(role_id)) {
        throw new Error('Invalid role id, Please provide a valid role (1 for customer, 2 for mitra).');
    }
    if (await userModule.findUserByUsername(username)) {
        throw new Error('The username you entered is already exists, Please choose another.');
    }
    
    if (await userModule.findUserByEmail(email)) {
        throw new Error('The email address is already exists, Please use a different email address.');
    }
 
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
    }

    const id = `user-${crypto.randomUUID()}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        user_id: id,
        username,
        email,
        password: hashedPassword,
        location,
        name,
        phone,
        role_id,
        profilePicture: process.env.PROFILE_PICTURE_DEFAULT,
        createdAt: new Date().toISOString(),
    };

    await userModule.addUser(newUser);

    if (role_id === 1) {
        const newCustomer = {
            customer_id: `customer-${crypto.randomUUID()}`,
            user_id: id,
        };
        await userModule.addCustomer(newCustomer);
    }
};

module.exports = {
    registerUser,
};
