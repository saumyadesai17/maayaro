# Quick Test Guide

## 🚀 Testing Email/Password Login

### Step 1: Start your Next.js dev server
```powershell
npm run dev
```

### Step 2: Navigate to the login page
Open your browser and go to wherever your LoginPage component is rendered.

### Step 3: Try logging in with a test account

**Admin Account:**
```
Email: admin@maayaro.com
Password: Test@123
```
Should redirect to: `/admin/dashboard`

**Customer Account:**
```
Email: john.doe@example.com
Password: Test@123
```
Should redirect to: `/`

### Step 4: Test error handling

**Try invalid credentials:**
```
Email: wrong@example.com
Password: WrongPassword
```
Should show error message: "Invalid login credentials"

**Try empty form:**
- Click "Sign In" without filling fields
- Should show HTML5 validation errors

## 🔍 What to Look For

### ✅ Success Indicators
- Form submits when you click "Sign In"
- Button text changes to "Signing In..." during request
- All inputs and buttons are disabled while loading
- On success: Browser redirects to home or admin dashboard
- Session is created (check browser dev tools → Application → Cookies)

### ❌ Error Indicators  
- Error message appears in red banner above form
- Inputs remain enabled after error
- Can retry login after fixing credentials

## 🌐 Testing Google OAuth (Requires Setup First!)

### Prerequisites
1. Configure Google OAuth in Supabase Dashboard (see `AUTH_SETUP.md`)
2. Add Google Client ID and Secret
3. Set redirect URI to `http://localhost:3000/api/auth/callback`

### Testing Flow
1. Click the "Google" button
2. Should redirect to Google's login page
3. Sign in with your Google account
4. Grant permissions
5. Should redirect back to your site
6. Profile auto-created if first-time user
7. Redirects to home or dashboard

### If Google Login Doesn't Work
- Check browser console for errors
- Verify OAuth is configured in Supabase Dashboard
- Make sure redirect URI matches exactly
- Check `/api/auth/oauth` returns a URL
- See troubleshooting in `LOGIN_INTEGRATION.md`

## 📱 Testing UI States

### Loading State
- While login is processing:
  - Button shows "Signing In..."
  - All inputs are disabled (grayed out)
  - Google button is disabled
  - Remember me checkbox is disabled
  - Forgot password link is disabled

### Error State
- On login failure:
  - Red error banner appears with message
  - Form remains interactive
  - Can retry immediately

### Success State
- On successful login:
  - Page redirects (no intermediate state shown)
  - Session cookie is set
  - User profile is available

## 🐛 Common Issues

**"fetch failed" or network error**
- Make sure Next.js dev server is running
- Check that API route exists at `/api/auth/login`
- Verify Supabase environment variables are set

**"Invalid login credentials"**
- Verify user exists in Supabase Auth Dashboard
- Check password is exactly `Test@123`
- Try creating a new user via Supabase Dashboard

**Redirect to wrong page**
- Check role in profiles table matches user
- Verify redirect logic in `handleEmailLogin` function
- Check browser console for errors

**Google button does nothing**
- OAuth not configured in Supabase
- Check browser console for API errors
- Verify `/api/auth/oauth` endpoint works

## 🎯 Expected Behavior

### First-time User Flow
1. User doesn't exist in profiles table (but exists in auth.users)
2. Login via email/password
3. Profile auto-created by login endpoint
4. Redirects to appropriate page

### OAuth User Flow  
1. User clicks Google button
2. Redirects to Google OAuth
3. User grants permissions
4. Callback creates session
5. Profile auto-created if new user
6. Redirects to appropriate page

### Returning User Flow
1. User enters credentials
2. Login successful
3. Returns existing profile data
4. Redirects based on role

## 📊 Monitoring

### Browser DevTools
**Console Tab:**
- Look for "Login successful:" log on successful login
- Look for "Login error:" log on failures

**Network Tab:**
- POST to `/api/auth/login` should return 200 OK
- Response should have `{ success: true, user: {...}, profile: {...} }`

**Application Tab:**
- Check Cookies → should see Supabase auth cookies
- Check Local Storage → may see Supabase session data

### Supabase Dashboard
- Go to Authentication → Users
- Should see users logging in (last_sign_in_at updates)
- Check Table Editor → profiles → verify profile data exists

## ✨ All Test Users

```
1. admin@maayaro.com - Test@123 (super_admin)
2. john.doe@example.com - Test@123 (customer)
3. jane.smith@example.com - Test@123 (customer)
4. mike.jones@example.com - Test@123 (customer)
5. emily.davis@example.com - Test@123 (customer)
6. sarah.wilson@example.com - Test@123 (customer)
7. david.brown@example.com - Test@123 (customer)
8. lisa.anderson@example.com - Test@123 (customer)
```

All passwords are: `Test@123`

## 🎉 Ready to Test!

Your login page is now fully integrated with:
- ✅ Email/password authentication
- ✅ Google OAuth (after configuration)
- ✅ Error handling
- ✅ Loading states
- ✅ Role-based redirects
- ✅ Facebook UI (disabled as requested)

Just run `npm run dev` and test it out!
