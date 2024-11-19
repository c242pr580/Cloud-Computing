const userModule = require('../user/user.module');

const getUserBiodata = async (userId) => {
    const user = await userModule.findUserById(userId);
    if (!user) {
        throw new Error('User not found, Please ensure the user exists and try again.');
    }

    return {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        location: user.location,
        role_id: user.role_id,
        profilePicture: user.profilePicture
    };
};

const updateUserBiodata = async (userId, biodata) => {
    return await userModule.updateUserData(userId, biodata);
};


module.exports = {
    getUserBiodata,
    updateUserBiodata
};
