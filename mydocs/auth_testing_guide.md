# Auth Module Testing Guide

This guide explains how to set up Google OAuth2 credentials and test the implemented endpoints for **Issue Auth-02**.

## 1. Google Cloud Console Setup

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.
3.  Go to **APIs & Services > OAuth consent screen**:
    - Choose **External**.
    - Fill in the required app information (App name, user support email, developer contact info).
    - Add the scope: `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
4.  Go to **APIs & Services > Credentials**:
    - Click **Create Credentials > OAuth client ID**.
    - Application type: **Web application**.
    - Name: `Smart Campus Hub`.
    - **Authorized JavaScript origins**: `http://localhost:8080` and `http://localhost:5173`.
    - **Authorized redirect URIs**: `http://localhost:8080/login/oauth2/code/google`.
5.  Copy your **Client ID** and **Client Secret**.

## 2. Environment Configuration

Update your `.env` file in the project root:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
INITIAL_ADMIN_EMAIL=your_own_email@gmail.com
```

*Note: Set `INITIAL_ADMIN_EMAIL` to your own email so that when you log in via Google, you are automatically recognized as the `SUPER_ADMIN` instead of a new `PENDING_PROFILE` user.*

## 3. Testing the Endpoints (In Order)

### **Phase 1: Verification via Browser**

1.  **Start the Backend:**
    ```bash
    docker compose up --build
    ```
2.  **Check Initial Status:**
    Open `http://localhost:8080/api/auth/status` in your browser.
    - **Expected Result:** `{"authenticated": false}`.
3.  **Initiate Login:**
    Go to `http://localhost:8080/oauth2/authorization/google`.
    - **Expected Result:** Redirect to Google Login.
4.  **Complete Login:**
    Log in with your Google account.
    - **Expected Result:** You will be redirected back to `http://localhost:5173/dashboard` (which might show a 404 for now, but that's okay).
5.  **Verify Authenticated Status:**
    Go back to `http://localhost:8080/api/auth/status`.
    - **Expected Result:** You should see your user details, email, and name.
6.  **Logout:**
    Go to `http://localhost:8080/api/auth/logout`.
    - **Expected Result:** You are redirected to the login page, and `status` returns `authenticated: false` again.

### **Phase 2: Database Verification**

1.  Check your database (Neon or local PG).
2.  **Expected Result:** A new row should exist in the `users` table matching your Google profile.
