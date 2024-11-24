# WEB Server API SerabutInn
> Capstone Project C242-PR580

### Development Backend Endpoint
- **SerabutInn**: **https://serabutinn-1079606741730.asia-southeast2.run.app/**

# API Documentation

### User Register
- **URL**: `/register`
- **Method**: `POST`
- **Request Body**:
  - `username` as `string` - `Username`
  - `name` as `string` -` Name`
  - `email` as `string` - `Email`
  - `password` as `string` - `Password`
  - `phone` as `string` - `Phone Number`
  - `location` as `string` - `Location`
  - `role_id` as `number` - `Role ([1] Customer / [2] Mitra)`
- **Response**:

```json
{
    "status": 201,
    "message": "User registered successfully",
    "error": false
}
```
### User Login

- **URL**: `/login`
- **Method**: `POST`
- **Request Body**:
  - `email` as `string`
  - `password` as `string`
- **Response User Login As Customer**:

```json
{
    "status": 200,
    "message": "Login successfully",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTVkMWZiZDQ4LWVkZjItNDFmOC05YzcwLTEyMTA2ZWZiODE0ZiIsInJvbGUiOjEsImlhdCI6MTczMTk1NjE3NCwiZXhwIjoxNzM0NTQ4MTc0fQ.b8gYwZwAn2LllOUlwdhRcLGmwg2415ajHtreb4Zkyt5",
        "userId": "user-5d1fbd48-edf2-41f8-9c70-12106efb814f",
        "name": "Lost Vape 1",
        "username": "lost_vape1",
        "email": "lostvape1@outlook.com",
        "role_id": 1,
        "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
        "createdAt": "2024-11-23 01:44:12"
    },
    "error": false
}
```
- **Response User Login As Mitra**:

```json
{
    "status": 200,
    "message": "Login successfully",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLWZmNWI1MTE1LTQ2MWQtNDIwMS1hZDkxLWFkNGQ4MDU4ZDU5MSIsInJvbGUiOjIsImlhdCI6MTczMjA0NDcyMywiZXhwIjoxNzM0NjM2NzIzfQ.ymqkrAU9VNHIvTSCq6iGTa9MDYkS5BBPR9lCr7x178p",
        "userId": "user-ff5b5115-461d-4201-ad91-ad4d8058d591",
        "name": "Lost Vape 2",
        "username": "lost_vape2",
        "email": "lostvape2@outlook.com",
        "role_id": 2,
        "mitra_id": "mitra-bee38d87-c749-4406-9c92-4eeb30f1aa32",
        "createdAt": "2024-11-23 01:44:12"
    },
    "error": false
}
```
### Get Biodata User

- **URL**: `/biodata`
- **Method**: `GET`
- **Auth required**: `YES`
- **Response**:

```json
{
    "status": 200,
    "message": "User biodata retrieved successfully",
    "data": {
        "userId": "user-63995084-f9f5-42f0-be6e-eab597671000",
        "name": "Mr Babe",
        "email": "mrbabe000@gmail.com",
        "username": "mrbabe",
        "phone": "082109098989",
        "location": "Bangka Belitung",
        "role_id": "Mitra",
        "profilePicture": "https://storage.googleapis.com/serabutinn-bucket/profile_picture_default.jpg",
        "createdAt": "2024-11-23 01:44:12"
    },
    "error": false
}
```
### Update Biodata User

- **URL**: `/biodata/update`
- **Method**: `POST`
- **Auth required**: `YES`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body (Optional)**:
  - `name` as `string` - `Name`
  - `phone` as `string` - `Phone Number`
  - `location` as `string` - `Location`
  - `image` as `file` - `File Photo Profile`
- **Response**:

```json
{
    "status": 200,
    "message": "User biodata updated successfully",
    "error": false
}
```
### Create A Jobs With Image

- **URL**: `/customer/jobs/create`
- **Method**: `POST`
- **Auth required**: `YES`
- **Role required**: `Customer`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body**:
  - `title` as `string` - `Title A Jobs`
  - `cost` as `number` - `Cost A Jobs`
  - `deadline` as `string` - `Deadline A Jobs`
  - `location` as `string` - `Location A Jobs`
  - `description` as `string` - `Description A Jobs`
- **Request Body (Optional)**:
  - `image` as `file` - `File Photo A Jobs`
- **Response With Image**:

```json
{
    "status": 201,
    "message": "Job created successfully",
    "data": {
        "job_id": "job-3e4fbb2c-3ea0-4494-8c85-9a1df7c423b7",
        "title": "Antar Barang",
        "deadline": "2024-11-23",
        "location": "Bandung",
        "cost": "200000",
        "description": "Anti Lama",
        "image": "https://storage.googleapis.com/serabutinn-bucket/customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164-1732385183576-Passbook-Printer-PLQ-20.jpg",
        "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
        "status": "Pending",
        "createdAt": "2024-11-24 01:06:23"
    },
    "error": false
}
```
- **Response No With Image**:
```json
{
    "status": 201,
    "message": "Job created successfully",
    "data": {
        "job_id": "job-3e4fbb2c-3ea0-4494-8c85-9a1df7c423b7",
        "title": "Antar Barang",
        "deadline": "2024-11-23",
        "location": "Bandung",
        "cost": "200000",
        "description": "Anti Lama",
        "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
        "status": "Pending",
        "createdAt": "2024-11-24 01:06:23"
    },
    "error": false
}
```
### Update A Jobs

- **URL**: `/customer/jobs/update/{job_id}`
- **Method**: `POST`
- **Auth required**: `YES`
- **Role required**: `Customer`
- **Request Header**:
  - `Content-Type` : `multipart/form-data`
- **Request Body (Optional)**:
  - `title` as `string` - `Title A Jobs`
  - `cost` as `number` - `Cost A Jobs`
  - `deadline` as `string` - `Deadline A Jobs`
  - `location` as `string` - `Location A Jobs`
  - `description` as `string` - `Description A Jobs`
  - `image` as `file` - `File Photo A Jobs`
- **Response**:

```json
{
    "status": 200,
    "message": "Job updated successfully",
    "error": false
}
```
### Delete A Jobs

- **URL**: `/customer/jobs/delete/{job_id}`
- **Method**: `DELETE`
- **Auth required**: `YES`
- **Role required**: `Customer`
- **Response**:

```json
{
    "status": 200,
    "message": "Job deleted successfully",
    "error": false
}
```
### Get All Jobs Customer By CustomerId

- **URL**: `/customer/jobs`
- **Method**: `GET`
- **Auth required**: `YES`
- **Role required**: `Customer`
- **Response**:

```json
{
    "status": 200,
    "message": "Job retrieved successfully",
    "data": [
        {
            "job_id": "job-031127a4-4d44-460d-afd0-44bae1d3c843",
            "title": "Antar Barang",
            "deadline": "2024-11-23",
            "location": "Bandung",
            "cost": "200000",
            "description": "Anti Lama",
            "image": null,
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "createdAt": "2024-11-24 01:19:57",
            "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8",
            "status": "In Progress",
            "order_id": "order-bbcc4643-7afe-40a4-ad2d-3ae927a14cd6"
        },
         {
            "job_id": "job-031127a4-4d44-460d-afd0-44bae1d3c843",
            "title": "Antar Barang",
            "deadline": "2024-11-21",
            "location": "Bandung",
            "cost": "200000",
            "description": "Anti Lama",
            "image": null,
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "createdAt": "2024-11-24 01:19:57",
            "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8",
            "status": "Canceled",
            "canceledAt": "2024-11-24 01:27:37",
            "order_id": "order-bbcc4643-7afe-40a4-ad2d-3ae927a14cd6"
        },
        {
            "job_id": "job-8ad0241b-bb26-4a53-8f1e-6198300d25bc",
            "title": "Antar Barang",
            "deadline": "2024-11-25",
            "location": "Bandung",
            "cost": "200000",
            "description": "Anti Lama",
            "image": "https://storage.googleapis.com/serabutinn-bucket/customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164-1732384166226-Passbook-Printer-PLQ-20.jpg",
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "createdAt": "2024-11-24 00:49:26",
            "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8",
            "order_id": "order-09839d9e-a912-47fa-9e9e-6661407c405e",
            "completedAt": "2024-11-24 01:27:37",
            "status": "Completed"
        },
        {
            "job_id": "job-e4d69f7d-4a6b-431e-b3d8-d3f8c6b31d69",
            "title": "Antar Barang",
            "deadline": "2024-11-23",
            "location": "Bandung",
            "cost": "200000",
            "description": "Anti Lama",
            "image": "https://storage.googleapis.com/serabutinn-bucket/customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164-1732384234513-Passbook-Printer-PLQ-20.jpg",
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "status": "Pending",
            "createdAt": "2024-11-24 00:50:34"
        }
    ],
    "error": false
}
```
### Create A Payment Link By JobId

- **URL**: `/customer/payment/create`
- **Method**: `POST`
- **Auth required**: `YES`
- **Role required**: `Customer`
- **Request Body**:
  - `job_id` as `string` - `Job Id`
- **Response**:

```json
{
    "status": 201,
    "message": "Payment link created successfully",
    "data": {
        "paymentUrl": "https://app.sandbox.midtrans.com/snap/v4/redirection/4494aa08-fca2-4beb-a09a-8b63514f6b65",
        "order_id": "order-09839d9e-a912-47fa-9e9e-6661407c405e"
    },
    "error": false
}
```
### Complete A Job By Customer

- **URL**: `/customer/jobs/complete/{job_id}`
- **Method**: `POST`
- **Auth required**: `YES`
- **Role required**: `Customer`
- **Response**:

```json
{
    "status": 200,
    "message": "Job marked as completed successfully",
    "data": {
        "job_id": "job-8ad0241b-bb26-4a53-8f1e-6198300d25bc",
        "title": "Antar Barang",
        "deadline": "2024-11-25",
        "location": "Bandung",
        "cost": "200000",
        "description": "Anti Lama",
        "image": "https://storage.googleapis.com/serabutinn-bucket/customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164-1732384166226-Passbook-Printer-PLQ-20.jpg",
        "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
        "createdAt": "2024-11-24 00:49:26",
        "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8",
        "status": "Completed",
        "order_id": "order-09839d9e-a912-47fa-9e9e-6661407c405e",
        "completedAt": "2024-11-24 01:27:37"
    },
    "error": false
}
```
### Take A Job By Mitra

- **URL**: `/mitra/jobs/assign/{job_id}`
- **Method**: `POST`
- **Auth required**: `YES`
- **Role required**: `Mitra`
- **Response**:

```json
{
    "status": 200,
    "message": "Job assigned successfully",
    "data": {
        "job_id": "job-8ad0241b-bb26-4a53-8f1e-6198300d25bc",
        "title": "Antar Barang",
        "deadline": "2024-11-25",
        "location": "Bandung",
        "cost": "200000",
        "description": "Anti Lama",
        "image": "https://storage.googleapis.com/serabutinn-bucket/customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164-1732384166226-Passbook-Printer-PLQ-20.jpg",
        "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
        "status": "In Progress",
        "createdAt": "2024-11-24 00:49:26",
        "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8"
    },
    "error": false
}
```
### Get All Jobs Take By MitraId

- **URL**: `/mitra/jobs`
- **Method**: `GET`
- **Auth required**: `YES`
- **Role required**: `Mitra`
- **Response**:

```json
{
    "status": 200,
    "message": "Job retrieved successfully.",
    "data": [
        {
            "job_id": "job-031127a4-4d44-460d-afd0-44bae1d3c843",
            "title": "Antar Barang",
            "deadline": "2024-11-23",
            "location": "Bandung",
            "cost": "200000p",
            "description": "Anti Lama",
            "image": null,
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "createdAt": "2024-11-24 01:19:57",
            "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8",
            "order_id": "order-bbcc4643-7afe-40a4-ad2d-3ae927a14cd6",
            "status": "Canceled",
            "canceledAt": "2024-11-24 01:30:01"
        },
        {
            "job_id": "job-2bd9eeb0-3164-4a71-9fd5-6ee3836747a6",
            "title": "Antar Barang",
            "deadline": "2024-11-23",
            "location": "Bandung",
            "cost": "200000p",
            "description": "Anti Lama",
            "image": null,
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "createdAt": "2024-11-24 01:39:08",
            "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8",
            "status": "In Progress"
        },
        {
            "job_id": "job-8ad0241b-bb26-4a53-8f1e-6198300d25bc",
            "title": "Antar Barang",
            "deadline": "2024-11-25",
            "location": "Bandung",
            "cost": "200000",
            "description": "Anti Lama",
            "image": "https://storage.googleapis.com/serabutinn-bucket/customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164-1732384166226-Passbook-Printer-PLQ-20.jpg",
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "createdAt": "2024-11-24 00:49:26",
            "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8",
            "order_id": "order-09839d9e-a912-47fa-9e9e-6661407c405e",
            "completedAt": "2024-11-24 01:27:37",
            "status": "Completed"
        }
    ],
    "error": false
}
```
### Get All Jobs In Mitra

- **URL**: `/alljobs`
- **Method**: `GET`
- **Auth required**: `YES`
- **Role required**: `Mitra`
- **Response**:

```json
{
    "status": 200,
    "message": "All Jobs retrieved successfully",
    "data": [
        {
            "job_id": "job-031127a4-4d44-460d-afd0-44bae1d3c843",
            "title": "Antar Barang",
            "deadline": "2024-11-23",
            "location": "Bandung",
            "cost": "200000p",
            "description": "Anti Lama",
            "image": null,
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "createdAt": "2024-11-24 01:19:57",
            "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8",
            "order_id": "order-bbcc4643-7afe-40a4-ad2d-3ae927a14cd6",
            "status": "Canceled",
            "canceledAt": "2024-11-24 01:30:01"
        },
        {
            "job_id": "job-2bd9eeb0-3164-4a71-9fd5-6ee3836747a6",
            "title": "Antar Barang",
            "deadline": "2024-11-23",
            "location": "Bandung",
            "cost": "200000p",
            "description": "Anti Lama",
            "image": null,
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "createdAt": "2024-11-24 01:39:08",
            "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8",
            "canceledAt": "2024-11-24 01:40:00",
            "status": "Canceled"
        },
        {
            "job_id": "job-8ad0241b-bb26-4a53-8f1e-6198300d25bc",
            "title": "Antar Barang",
            "deadline": "2024-11-25",
            "location": "Bandung",
            "cost": "200000",
            "description": "Anti Lama",
            "image": "https://storage.googleapis.com/serabutinn-bucket/customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164-1732384166226-Passbook-Printer-PLQ-20.jpg",
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "createdAt": "2024-11-24 00:49:26",
            "mitra_id": "mitra-6c415957-115b-478d-8b23-0288aeff7bc8",
            "order_id": "order-09839d9e-a912-47fa-9e9e-6661407c405e",
            "completedAt": "2024-11-24 01:27:37",
            "status": "Completed"
        },
        {
            "job_id": "job-e4d69f7d-4a6b-431e-b3d8-d3f8c6b31d69",
            "title": "Antar Barang",
            "deadline": "2024-11-23",
            "location": "Bandung",
            "cost": "200000",
            "description": "Anti Lama",
            "image": "https://storage.googleapis.com/serabutinn-bucket/customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164-1732384234513-Passbook-Printer-PLQ-20.jpg",
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "status": "Pending",
            "createdAt": "2024-11-24 00:50:34"
        }
    ],
    "error": false
}
```
### Get All Jobs Pending In Mitra

- **URL**: `/jobs/pending`
- **Method**: `GET`
- **Auth required**: `YES`
- **Role required**: `Mitra`
- **Response**:

```json
{
    "status": 200,
    "message": "Pending jobs retrieved successfully",
    "data": [
        {
            "job_id": "job-e4d69f7d-4a6b-431e-b3d8-d3f8c6b31d69",
            "title": "Antar Barang",
            "deadline": "2024-11-23",
            "location": "Bandung",
            "cost": "200000",
            "description": "Anti Lama",
            "image": "https://storage.googleapis.com/serabutinn-bucket/customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164-1732384234513-Passbook-Printer-PLQ-20.jpg",
            "customer_id": "customer-fdc56e2c-033f-4fcb-bf88-e8a0ca3da164",
            "status": "Pending",
            "createdAt": "2024-11-24 00:50:34"
        }
    ],
    "error": false
}
```
