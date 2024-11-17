const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userModule = require('../register/register.module');

const registerUser = async (userData) => {
    const { username, email, password, location, name, phone, role_id } = userData;

    if (await userModule.findUserByUsername(username)) {
        throw new Error('The username you entered is already exists, Please choose another.');
    }
    
    if (await userModule.findUserByEmail(email)) {
        throw new Error('The email address is already exists, Please use a different email address.');
    }
 
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
    }

    const id = crypto.randomUUID();
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
};

module.exports = {
    registerUser,
};
