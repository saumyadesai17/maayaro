import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .limit(5)

  return (
    <div>
      <h1>Database Test</h1>
      <pre>{JSON.stringify(categories, null, 2)}</pre>
    </div>
  )
}