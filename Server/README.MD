# Waste-Management-System Server

## Overview

This project is a Waste Management System (WMS) server built with Node.js, Express, and MongoDB. It provides APIs for user authentication, managing reports, rewards, transactions, and notifications.

## Project Structure

```
.env
.env.example
controllers/
	AuthController.js
	ImpactController.js
	ReportControllers.js
	UserController.js
db/
	dbConfig.js
	Schemas.js
index.js
middleware/
	AuthMiddleware.js
package.json
Routes/
	AuthRoutes.js
	ReportRoutes.js
	UserRoutes.js
```

## Environment Variables

The project uses environment variables defined in the `.env` file. An example configuration is provided in `.env.example`.

- `DB_URL` : MongoDB connection string
- `PORT` : Server port
- `CLIENT_URL` : Frontend URL
- `JWT_KEY` : JWT secret key

## Installation

1. Clone the repository.
2. Install dependencies:
    ```
    npm install
    ```
3. Create a `.env` file based on the `.env.example` and fill in the required values.
4. Start the server:
    ```
    npm run dev
    ```

# API Documentation

## Authentication Routes

### POST `/api/auth/sign-up`
- **Description**: Register a new user.
- **Protected**: No
- **Request**:
  - Body:
    ```json
    {
      "email": "user@example.com",
      "password": "password123",
      "name": "John Doe"
    }
    ```
- **Response**:
  - Status: `201` Created
    ```json
    {
      "notification": [],
      "totalBalance": 0,
      "user": {
        "email": "user@example.com",
        "id": "userId",
        "name": "John Doe"
      }
    }
    ```
  - Status: `400` Bad Request
    ```text
    "All fields are required"
    ```
  - Status: `409` Conflict
    ```text
    "User with email Already exists"
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### POST `/api/auth/login`
- **Description**: Log in an existing user.
- **Protected**: No
- **Request**:
  - Body:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
- **Response**:
  - Status: `200` OK
    ```json
    {
      "user": {
        "id": "userId",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "notification": [],
      "totalBalance": 0
    }
    ```
  - Status: `400` Bad Request
    ```text
    "Email and password are required"
    ```
  - Status: `404` Not Found
    ```text
    "User not found"
    ```
  - Status: `401` Unauthorized
    ```text
    "Invalid credentials"
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### GET `/api/auth/user-info`
- **Description**: Get user information.
- **Protected**: Yes
- **Response**:
  - Status: `200` OK
    ```json
    {
      "user": {
        "id": "userId",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "notification": [],
      "totalBalance": 0
    }
    ```
  - Status: `401` Unauthorized
    ```text
    "You are not Authenticated"
    ```
  - Status: `404` Not Found
    ```text
    "User Not Found"
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### GET `/api/auth/logout`
- **Description**: Log out the current user.
- **Protected**: Yes
- **Response**:
  - Status: `200` OK
    ```text
    "Logged Out Successfully"
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

## User Routes

### POST `/api/user/set-reward`
- **Description**: Set a reward for a user.
- **Protected**: Yes
- **Request**:
  - Body:
    ```json
    {
      "points": 100,
      "name": "collect"//must be collect || report
    }
    ```
- **Response**:
  - Status: `201` Created
    ```text
    "Reward Set Successfully"
    ```
  - Status: `400` Bad Request
    ```text
    "Please provide all the details."
    ```
  - Status: `401` Unauthorized
    ```text
    "You are not Authenticated."
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### PATCH `/api/user/redeem-reward`
- **Description**: Redeem a reward for a user.
- **Protected**: Yes
- **Request**:
  - Body:
    ```json
    {
      "rewardId": "rewardId"
    }
    ```
- **Response**:
  - Status: `200` OK
    ```text
    "Reward Redeemed Successfully"
    ```
  - Status: `400` Bad Request
    ```text
    "Please provide all the details."
    ```
  - Status: `401` Unauthorized
    ```text
    "You are not Authenticated."
    ```
  - Status: `404` Not Found
    ```text
    "Reward Not Found"
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### PATCH `/api/user/redeem-all-rewards`
- **Description**: Redeem all rewards for a user.
- **Protected**: Yes
- **Request**:
  - Body:
    ```json
    {
      "points": 100
    }
    ```
- **Response**:
  - Status: `200` OK
    ```text
    "All Rewards Redeemed Successfully"
    ```
  - Status: `401` Unauthorized
    ```text
    "You are not Authenticated."
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### GET `/api/user/get-transactions-reward`
- **Description**: Get all transactions and rewards for a user.
- **Protected**: Yes
- **Response**:
  - Status: `200` OK
    ```json
    {
      "transactions": [],
      "rewards": []
    }
    ```
  - Status: `401` Unauthorized
    ```text
    "You are not Authenticated."
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### PATCH `/api/user/mark-notification-read`
- **Description**: Mark a notification as read.
- **Protected**: Yes
- **Request**:
  - Body:
    ```json
    {
      "notificationId": "notificationId"
    }
    ```
- **Response**:
  - Status: `200` OK
    ```json
    {
      "msg": "Notification Marked as Read",
      "updatedNotification": {}
    }
    ```
  - Status: `401` Unauthorized
    ```text
    "You are not Authenticated."
    ```
  - Status: `404` Not Found
    ```text
    "No such Notification found"
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

## Report Routes

### POST `/api/report/create-report`
- **Description**: Create a new report.
- **Protected**: Yes
- **Request**:
  - Body:
    ```json
    {
      "report": {
        "location": "location",
        "type": "type",
        "amount": "amount",
        "imageUrl": "imageUrl",
        "verificationResult": {}
      },
      "reward": {
        "points": 100,
        "name": "report"
      }
    }
    ```
- **Response**:
  - Status: `201` Created
    ```json
    {
      "userId",
      "location",
      "wasteType",
      "amount",
      "imageUrl",
      "verificationResult",
    }
    ```
  - Status: `400` Bad Request
    ```text
    "All fields are required"
    ```
  - Status: `401` Unauthorized
    ```text
    "You are not Authenticated."
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### GET `/api/report/get-recent-report`
- **Description**: Get recent reports.
- **Protected**: Yes
- **Request**:
  - Query Parameters:
    - `skip`: Number of reports to skip.
    - `limit`: Number of reports to return.
- **Response**:
  - Status: `200` OK
    ```json
    {
      "reports": [],
      "totalReports": 0
    }
    ```
  - Status: `400` Bad Request
    ```text
    "Skip and Limit are required"
    ```
  - Status: `401` Unauthorized
    ```text
    "You are not Authenticated."
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### GET `/api/report/get-reports`
- **Description**: Get all reports for a user.
- **Protected**: Yes
- **Request**:
  - Query Parameters:
    - `skip`: Number of reports to skip.
    - `limit`: Number of reports to return.
- **Response**:
  - Status: `200` OK
    ```json
    {
      "reports": []
    }
    ```
  - Status: `401` Unauthorized
    ```text
    "You are not Authenticated."
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### PATCH `/api/report/update-report`
- **Description**: Update a report's status.
- **Protected**: Yes
- **Request**:
  - Body:
    ```json
    {
      "reportId": "reportId",
      "status": "status"
    }
    ```
- **Response**:
  - Status: `200` OK
    ```json
    {
      "report": {}
    }
    ```
  - Status: `400` Bad Request
    ```text
    "All fields are required"
    ```
  - Status: `401` Unauthorized
    ```text
    "You are not Authenticated."
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

## Impact Routes

### GET `/api/impact-data`
- **Description**: Get impact data.
- **Protected**: No
- **Response**:
  - Status: `200` OK
    ```json
    {
      "reportsSubmitted": 0,
      "wasteCollected": 0,
      "tokensEarned": 0,
      "co2Offset": 0
    }
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```

### GET `/api/leaderboard-data`
- **Description**: Get leaderboard data.
- **Protected**: No
- **Response**:
  - Status: `200` OK
    ```json
    [
      {
        "userInfo": {
          "id": "userId",
          "name": "John Doe",
          "email": "user@example.com"
        },
        "points": 0,
        "level": 0
      }
    ]
    ```
  - Status: `500` Internal Server Error
    ```text
    "Internal Server Error"
    ```