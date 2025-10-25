# 🔧 Vercel Environment Variables Checklist

## Required Environment Variables

Your admin dashboard **MUST** have this environment variable set in Vercel:

### `NEXT_PUBLIC_API_URL`
- **Value:** `https://swrfph-backend-production.up.railway.app`
- **Important:** NO trailing slash!

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your admin dashboard project
3. Go to **Settings** → **Environment Variables**
4. Add the variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://swrfph-backend-production.up.railway.app`
   - **Environments:** Check all three boxes (Production, Preview, Development)
5. Click **Save**
6. **IMPORTANT:** Redeploy your app for the changes to take effect
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Click **Redeploy**

## How to Verify It's Set Correctly

After redeployment:

1. Open your admin dashboard
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for this log:
   ```
   🔧 API Configuration: {
       NEXT_PUBLIC_API_URL: "https://swrfph-backend-production.up.railway.app",
       API_BASE_URL: "https://swrfph-backend-production.up.railway.app",
       fallbackUsed: false
   }
   ```

### ✅ Correct Configuration:
- `NEXT_PUBLIC_API_URL` shows your Railway URL
- `fallbackUsed: false`

### ❌ Incorrect Configuration:
- `NEXT_PUBLIC_API_URL: undefined`
- `API_BASE_URL: "http://localhost:5000"`
- `fallbackUsed: true`

If you see the incorrect configuration, the environment variable is NOT set in Vercel!

## Common Issues

### Issue: Variable is set but still showing undefined
**Solution:** You need to **redeploy** after setting environment variables. Setting them alone doesn't update existing deployments.

### Issue: Shows correct in preview but wrong in production
**Solution:** Make sure you checked the "Production" checkbox when setting the environment variable.

### Issue: Still using localhost
**Solution:** Clear your browser cache and do a hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`)

