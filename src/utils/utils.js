const removeNullProperties = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== null));
};

module.exports = {
    removeNullProperties,
};
