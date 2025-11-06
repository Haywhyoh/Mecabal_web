# Google OAuth Setup for Web

This document explains how to set up Google OAuth authentication for the MeCabal web application.

## Prerequisites

1. A Google Cloud Project with OAuth 2.0 credentials
2. A Web application OAuth 2.0 Client ID from Google Cloud Console

## Backend Configuration

The backend already supports Google OAuth. Ensure the following environment variables are set in your backend `.env` file:

```env
# Google OAuth Configuration (Web Client ID and Secret)
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Mobile Client IDs (if you have them)
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# Google OAuth Callback URL (for Passport strategy - required if using redirect flow)
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

**Important Notes:**
- `GOOGLE_CLIENT_SECRET` is required for the Passport Google Strategy (used by `/auth/google` redirect endpoints)
- The ID token flow (`/auth/google/web`) doesn't require the secret - it only needs the Client ID for token verification
- The client secret should **NEVER** be exposed in frontend code or environment variables prefixed with `NEXT_PUBLIC_`

## Frontend Configuration

Add the following environment variable to your frontend `.env.local` file:

```env
# Google OAuth Web Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com

# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Setting Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Configure the OAuth consent screen if prompted
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - Your production domain (e.g., `https://mecabal.com`)
8. Add authorized redirect URIs (if using Passport strategy):
   - `http://localhost:3001/api/auth/google/callback` (for local development)
   - Your production callback URL
9. After creating the OAuth client:
   - Copy the **Client ID** - add this to both frontend (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`) and backend (`GOOGLE_CLIENT_ID`)
   - Copy the **Client Secret** - add this to backend only (`GOOGLE_CLIENT_SECRET`)
   - **Never expose the Client Secret in frontend code or public repositories**

## How It Works

### Backend Flow

1. Frontend sends Google ID token to `/auth/google/web` endpoint
2. Backend verifies the ID token using `GoogleTokenVerifierService`
3. Backend processes the user through `AuthService.validateGoogleUser()`
4. Backend returns JWT tokens and user information

### Frontend Flow

1. User clicks "Sign in with Google" button
2. Google Identity Services (GIS) script loads
3. User authenticates with Google
4. Google returns an ID token
5. Frontend sends ID token to backend `/auth/google/web` endpoint
6. Backend validates and processes the authentication
7. Frontend stores tokens and updates user context
8. User is redirected to appropriate step (phone verification or dashboard)

## Implementation Details

### Backend Endpoint

- **Endpoint**: `POST /auth/google/web`
- **Request Body**: 
  ```json
  {
    "idToken": "google-id-token-string"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      ...
    },
    "isNewUser": false
  }
  ```

### Frontend Components

- **Google Auth Utility**: `src/lib/google-auth.ts`
  - Handles Google Identity Services initialization
  - Manages script loading and button rendering
  
- **API Client**: `src/lib/api.ts`
  - `googleAuthWeb(idToken)` method for backend communication

- **Welcome Screen**: `src/components/onboarding/WelcomeScreen.tsx`
  - Integrated Google Sign-In button
  - Handles authentication flow and error states

## Testing

1. Ensure all environment variables are set
2. Start the backend server
3. Start the frontend development server (`npm run dev`)
4. Navigate to the onboarding page
5. Click "Sign in with Google"
6. Complete Google authentication
7. Verify that tokens are stored and user is redirected appropriately

## Troubleshooting

### "Google Client ID is not configured"
- Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Restart the Next.js development server after adding environment variables

### "Google Identity Services not available"
- Check browser console for script loading errors
- Verify that the Google script is loading from `https://accounts.google.com/gsi/client`
- Check network tab for blocked requests

### "Invalid Google ID token"
- Verify that the Client ID in frontend matches the one in backend
- Ensure the token hasn't expired (ID tokens expire after 1 hour)
- Check that the token is being sent correctly to the backend

### Authentication succeeds but user not redirected
- Check browser console for errors
- Verify that tokens are being stored in localStorage
- Check that the onboarding context is updating correctly

## Security Notes

- **Never expose the Google Client Secret in frontend code** - it should only be in backend environment variables
- The Client Secret is only needed for the Passport redirect flow (`/auth/google` and `/auth/google/callback`)
- The ID token flow (`/auth/google/web`) only requires the Client ID for verification
- Always use HTTPS in production
- Validate tokens on the backend (already implemented)
- Store tokens securely (consider httpOnly cookies for production)
- Keep your `.env` files out of version control (use `.gitignore`)

## Next Steps

After Google authentication:
- New users will be directed to phone verification
- Existing users with incomplete profiles will complete onboarding
- Fully verified users will be redirected to the dashboard

