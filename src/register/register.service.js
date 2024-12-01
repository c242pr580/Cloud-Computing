const bcrypt = require('bcrypt');
const crypto = require('crypto');
const registerModule = require('../register/register.module');
const { getCurrentTime } = require('../utils/time');

const registerUser = async (userData) => {
    const { username, email, password, location, name, phone } = userData;

    let role_id = parseInt(userData.role_id, 10);

    if (![1, 2].includes(role_id)) {
        throw new Error('Invalid role id, Please provide a valid role (1 for customer, 2 for mitra).');
    }
    if (await registerModule.findUserByUsername(username)) {
        throw new Error('The username you entered is already exists, Please choose another.');
    }
    
    if (await registerModule.findUserByEmail(email)) {
        throw new Error('The email address is already exists, Please use a different email address.');
    }
 
    const id = `user-${crypto.randomUUID()}`;
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        user_id: id,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        location,
        name,
        phone,
        role_id,
        profilePicture: process.env.PROFILE_PICTURE_DEFAULT,
        createdAt: getCurrentTime(),
    };

    await registerModule.addUser(newUser);

    if (role_id === 1) {
        const newCustomer = {
            customer_id: `customer-${crypto.randomUUID()}`,
            user_id: id,
        };
        await registerModule.addCustomer(newCustomer);
    }
    if (role_id === 2) {
        const newMitra = {
            mitra_id: `mitra-${crypto.randomUUID()}`,
            user_id: id,
        };
        await registerModule.addMitra(newMitra);
    }
};

module.exports = {
    registerUser
};
