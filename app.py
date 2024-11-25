from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np

app = Flask(__name__)

model = tf.keras.models.load_model('model/job_22_model.h5')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        
        data = request.json
        if not data or 'input' not in data:
            return jsonify({'error': 'Input data is required'}), 400
        
        input_data = np.array(data['input'])  
        input_data = input_data.reshape(1, -1)  

        predictions = model.predict(input_data)
        result = predictions.tolist()  
        
        return jsonify({'predictions': result})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'API is running'}), 200

if __name__ == '__main__':
    app.run(debug=True)
