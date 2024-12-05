
<p align="center">
  <img src="image/serabutinn.png" alt="SerabutInn logo" height="180" />
</p>


# Backend Model FACE RECOGNITION API SerabutInn
> Capstone Project C242-PR580

### Development Backend Model FACE RECOGNITION Endpoint
- **SerabutInn Model FACE RECOGNITION**: **https://serabutinn-model-face-1079606741730.asia-southeast2.run.app**

# API Documentation

### Upload Verification Image

- **URL**: `/upload-verification-image`
- **Method**: `POST`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body**:
  - `verification_image` as `file` - `File Photo Customer`
  - `customer_id` as `string` - `Customer Id`
- **Response**:

```json
{
    "error": false,
    "message": "Uploaded verification image successfully",
    "status": 201
}
```
### Verify Customer Image

- **URL**: `/predict`
- **Method**: `POST`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body**:
  - `input_image` as `file` - `File Photo Customer`
  - `customer_id` as `string` - `Customer Id`
- **Response (Verified)**:

```json
{
    "data": {
        "threshold": 0.1981,
        "verification_score": 0.0,
        "verified": true
    },
    "error": false,
    "message": "Model predicted successfully",
    "status": 200
}
```
- **Response (No Verified)**:

```json
{
    "data": {
        "threshold": 0.2567,
        "verification_score": 0.23455545,
        "verified": false
    },
    "error": false,
    "message": "Model predicted successfully",
    "status": 200
}
```
## Contributors

### Cloud Computing Member
Cloud Computing member is responsible for the development of the API service and deployment of the model. In sort, in this project Cloud Computing is responsible for Backend, Infrastructure, and DevOps.

- Louis Michael
- Muhammad Baharuddin Yusuf
- Mulia Rahmah
#### Individuals

<div style="display: grid; grid-template-columns: auto auto; gap: 10px;">
 <img src="https://contrib.rocks/image?repo=c242pr580/Cloud-Computing" />
  <img src="image/yusuf.png" width="64" height="64" />
   <img src="image/mulia.png" width="64" height="64" />
</div>
