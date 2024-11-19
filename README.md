# WEB Server API Serabut Inn
> Capstone Project C242-PR580

# API Documentation

## Register

### User Register
- **URL** : `/register`
- **Method** : `POST`
- **Request Body** :
  - `username` as `string` - `Username`
  - `name` as `string` -` Name`
  - `email` as `string` - `Email`
  - `password` as `string` - `Password`
  - `phone` as `string` - `Phone`
  - `location` as `string` - `Location`
  - `role_id` as `string` - `Role ([1] Customer / [2] Mitra)`
- **Response** :

```json
{
    "status": 201,
    "message": "User registered successfully",
    "error": false
}
```
### User Login as Customer

- **URL** : `/login`
- **Method** : `POST`
- **Request Body**:
  - `email` as `string`
  - `password` as `string`
- **Response**:

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
        "createdAt": "2024-11-19T15:37:00.051Z"
    },
    "error": false
}
```
### User Login as Mitra

- **URL** : `/login`
- **Method** : `POST`
- **Request Body**:
  - `email` as `string`
  - `password` as `string`
- **Response**:

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
        "createdAt": "2024-11-19T15:37:00.051Z"
    },
    "error": false
}
```