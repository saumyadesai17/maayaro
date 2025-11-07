import 'dotenv/config'
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function login() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "test@gmail.com",
    password: "123456",
  })

  if (error) {
    console.error(error)
    return
  }

  console.log("access_token = ", data.session?.access_token)
  console.log("refresh_token = ", data.session?.refresh_token)
}

login()