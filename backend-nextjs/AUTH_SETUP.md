# Authentication API Setup Guide

## 📁 Created API Routes

All authentication routes are now available:

### Core Auth Routes
- `POST /api/auth/signup` - Email/password registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/logout` - Sign out user
- `GET /api/auth/user` - Get current user profile
- `POST /api/auth/oauth` - Initiate OAuth login (Google, GitHub, etc.)
- `GET /api/auth/callback` - OAuth callback handler

### Password Management
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Update password

---

## 🔧 Supabase Configuration Needed

### 1. Enable Google OAuth in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. You'll need to create a Google OAuth App:

#### Get Google OAuth Credentials:

**A. Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

**B. Enable Google+ API:**
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

**C. Create OAuth 2.0 Credentials:**
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Maayaro E-Commerce`
   
**D. Configure Authorized URLs:**
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://your-production-domain.com
     ```
   
   - **Authorized redirect URIs:**
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     Replace `YOUR_SUPABASE_PROJECT_REF` with your actual project reference
     (found in Supabase Dashboard → Settings → API)

**E. Copy Credentials:**
   - Copy **Client ID**
   - Copy **Client Secret**

**F. Add to Supabase:**
   - Back in Supabase Dashboard → Authentication → Providers → Google
   - Paste **Client ID**
   - Paste **Client Secret**
   - Click **Save**

---

### 2. Configure Site URL & Redirect URLs

Go to **Authentication** → **URL Configuration**:

- **Site URL**: `http://localhost:3000` (dev) or your production URL
- **Redirect URLs**: Add these:
  ```
  http://localhost:3000/api/auth/callback
  http://localhost:3000
  https://your-production-domain.com/api/auth/callback
  https://your-production-domain.com
  ```

---

### 3. Email Templates (Optional but Recommended)

Go to **Authentication** → **Email Templates** and customize:

- **Confirm signup** - Email verification
- **Magic Link** - Passwordless login
- **Change Email Address** - Email change confirmation
- **Reset Password** - Password reset link

---

## 📝 Usage Examples

### 1. Email/Password Signup

```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
    full_name: 'John Doe',
    phone: '+91-9876543210'
  })
})

const data = await response.json()
```

### 2. Email/Password Login

```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123'
  })
})

const data = await response.json()
// data.user, data.profile, data.session
```

### 3. Google OAuth Login

**Frontend:**
```typescript
const response = await fetch('/api/auth/oauth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'google'
  })
})

const { url } = await response.json()
// Redirect user to the OAuth URL
window.location.href = url
```

### 4. Get Current User

```typescript
const response = await fetch('/api/auth/user')
const data = await response.json()
// data.user, data.profile
```

### 5. Logout

```typescript
const response = await fetch('/api/auth/logout', {
  method: 'POST'
})
```

### 6. Forgot Password

```typescript
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com'
  })
})
```

---

## 🔐 Test with Existing Users

You already have test users created. Use these credentials:

| Email | Password | Role |
|-------|----------|------|
| admin@maayaro.com | Test@123 | super_admin |
| manager@maayaro.com | Test@123 | admin |
| john.doe@example.com | Test@123 | customer |
| jane.smith@example.com | Test@123 | customer |

---

## 🛡️ Security Features Included

- ✅ Password validation
- ✅ Email verification flow
- ✅ Password reset flow
- ✅ OAuth integration (Google, GitHub, Facebook ready)
- ✅ Automatic profile creation
- ✅ Session management via Supabase
- ✅ HTTP-only cookies (automatic via Supabase)

---

## 🚨 Important Notes

1. **Email Verification**: By default, Supabase requires email verification. You can disable this in:
   - Dashboard → Authentication → Providers → Email → **Confirm email** (toggle off for development)

2. **Password Requirements**: Default is 6 characters minimum. Can be changed in Supabase settings.

3. **Rate Limiting**: Supabase has built-in rate limiting. Configure in Dashboard if needed.

4. **Environment Variables**: Make sure your `.env.local` has:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

---

## 🎯 Next Steps

1. ✅ Configure Google OAuth in Supabase Dashboard
2. ✅ Test signup with email/password
3. ✅ Test login with Google OAuth
4. ✅ Build frontend login/signup forms
5. ✅ Add protected routes middleware
6. ✅ Create user dashboard

---

## 🔗 Useful Links

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
