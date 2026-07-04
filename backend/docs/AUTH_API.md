# Authentication API Documentation

Base URL: `http://localhost:4000/api/auth`

---

## 1. Register a New User
Registers a new customer into the system.

- **URL**: `/register`
- **Method**: `POST`
- **Auth required**: No

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Success Response (201 Created)**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe"
    }
  }
}
```

---

## 2. Login
Authenticates a user, issues a short-lived Access Token in the payload, and sets a long-lived Refresh Token as an `HttpOnly` cookie.

- **URL**: `/login`
- **Method**: `POST`
- **Auth required**: No

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK)**
*Note: A `Set-Cookie` header will be included for `refreshToken` (HttpOnly, Secure, SameSite=Strict).*
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER"
    },
    "accessToken": "eyJhbG..."
  }
}
```

---

## 3. Get Current User (Profile)
Retrieves the profile of the currently authenticated user based on their JWT.

- **URL**: `/profile`
- **Method**: `GET`
- **Auth required**: Yes (`Authorization: Bearer <accessToken>`)

**Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Profile fetched",
  "data": {
    "user": {
      "userId": "uuid",
      "role": "CUSTOMER",
      "iat": 1612345678,
      "exp": 1612346578
    }
  }
}
```

---

## 4. Refresh Token
Rotates the user's refresh token. It consumes the `refreshToken` cookie and issues a new access token and a new `HttpOnly` refresh token cookie.

- **URL**: `/refresh-token`
- **Method**: `POST`
- **Auth required**: No (Requires `refreshToken` cookie)

**Request Cookies**
- `refreshToken`: string

**Success Response (200 OK)**
*Note: A new `Set-Cookie` header will be included for the rotated `refreshToken`.*
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbG..."
  }
}
```

---

## 5. Logout
Revokes the current refresh token and clears the `HttpOnly` cookie.

- **URL**: `/logout`
- **Method**: `POST`
- **Auth required**: Yes (Requires both `Authorization` header and `refreshToken` cookie)

**Success Response (200 OK)**
*Note: The `Set-Cookie` header will be sent with an expired date to clear the token.*
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```