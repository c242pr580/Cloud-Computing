const tfjs = require('@tensorflow/tfjs-node');

function predict(model, title) {
    //preprocessing
   
    return model.predict(tensor).data();
}

module.exports = {
    predict,
};