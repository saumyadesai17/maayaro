// Quick script to get Supabase auth token for testing
// Run: node get-auth-token.js

const SUPABASE_URL = "https://wvmrfndcbcyscdmayqun.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bXJmbmRjYmN5c2NkbWF5cXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1ODg2NzMsImV4cCI6MjA3NzE2NDY3M30.yXDQn83cMfXcyQfc1n7mxR33-0szGCbB9_8VsxZ3xjU";

// Replace these with your test user credentials
const EMAIL = "test@gmail.com";
const PASSWORD = "123456";

async function getAuthToken() {
  try {
    console.log("🔐 Attempting to login...\n");
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Login successful!\n");
      console.log("📋 Copy this token for Postman:\n");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(data.access_token);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      
      console.log("📝 Use in Postman as:");
      console.log("   Header: Authorization");
      console.log(`   Value: Bearer ${data.access_token}\n`);
      
      console.log("⏰ Token expires at:", new Date(data.expires_at * 1000).toLocaleString());
      console.log("👤 User ID:", data.user.id);
      console.log("📧 Email:", data.user.email);
    } else {
      console.error("❌ Login failed:", data.error_description || data.error || "Unknown error");
      console.log("\n💡 Solutions:");
      console.log("1. Check if user exists in Supabase Dashboard → Authentication → Users");
      console.log("2. Create a test user:");
      console.log("   - Go to Supabase Dashboard");
      console.log("   - Authentication → Users → Add User");
      console.log("   - Email: test@example.com");
      console.log("   - Password: test123456");
      console.log("   - Auto Confirm: ON");
      console.log("\n3. Or update EMAIL and PASSWORD in this script");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

getAuthToken();
