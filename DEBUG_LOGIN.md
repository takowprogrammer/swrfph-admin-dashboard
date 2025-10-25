# 🔍 Admin Dashboard Login Debugging Guide

## Current Status
We've added detailed logging to help diagnose why login requests don't reach the backend.

## 🧪 How to Debug

### Step 1: Open Browser Console
1. Open your admin dashboard on Vercel
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Clear any existing logs

### Step 2: Check Initial Configuration
When the page loads, you should see:
```
🔧 API Configuration: {
    NEXT_PUBLIC_API_URL: "https://swrfph-backend-production.up.railway.app" (or undefined),
    API_BASE_URL: "https://swrfph-backend-production.up.railway.app",
    fallbackUsed: false (or true)
}
```

**What to look for:**
- ✅ `NEXT_PUBLIC_API_URL` should be your Railway URL
- ❌ If it's `undefined`, the environment variable is NOT set in Vercel
- ❌ If `fallbackUsed: true`, it's using `http://localhost:5000`

### Step 3: Try to Login
Enter credentials and click "Sign in". You should see:
```
AuthContext - Starting login for: admin@swrfph.com
🌐 API Request: {
    baseURL: "https://swrfph-backend-production.up.railway.app",
    cleanBaseURL: "https://swrfph-backend-production.up.railway.app",
    endpoint: "/auth/login",
    cleanEndpoint: "auth/login",
    finalURL: "https://swrfph-backend-production.up.railway.app/auth/login",
    method: "POST"
}
```

**What to look for:**
- ✅ `finalURL` should NOT have `//` in the path
- ✅ `finalURL` should be your Railway backend URL
- ❌ If it shows `localhost`, the environment variable is wrong

### Step 4: Check Network Tab
1. Go to the **Network** tab in Developer Tools
2. Try to login again
3. Look for the `login` request
4. Click on it to see:
   - Request URL
   - Request Method
   - Status Code
   - Response

**What to look for:**
- ✅ Request URL should be `https://swrfph-backend-production.up.railway.app/auth/login`
- ❌ If it shows `//auth/login`, the URL cleaning didn't work
- ❌ If status is `502`, backend is down
- ❌ If status is `CORS error`, CORS not configured properly

## 🔧 Common Issues & Fixes

### Issue 1: `NEXT_PUBLIC_API_URL` is undefined
**Fix:** Go to Vercel → Settings → Environment Variables → Add `NEXT_PUBLIC_API_URL`

### Issue 2: Using localhost instead of Railway URL
**Fix:** The environment variable is not set correctly in Vercel

### Issue 3: Getting 502 error
**Fix:** Backend is not running - check Railway logs

### Issue 4: Getting CORS error
**Fix:** Add your Vercel URL to `CORS_ORIGINS` in Railway backend

## 📋 What to Share with Me

After checking the console and network tab, share:
1. The `🔧 API Configuration` log output
2. The `🌐 API Request` log output
3. The Network tab request details (URL, status, response)
4. Any error messages in the console

This will help me pinpoint exactly where the issue is!
