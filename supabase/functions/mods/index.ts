import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const url = new URL(req.url)
  const method = req.method

  try {
    if (method === 'GET') {
      const category = url.searchParams.get('category')
      const game = url.searchParams.get('game')
      const search = url.searchParams.get('search')
      const limit = parseInt(url.searchParams.get('limit') || '20')

      let query = supabase
        .from('mods')
        .select('*, profiles(username)')
        .order('download_count', { ascending: false })
        .limit(limit)

      if (category) query = query.eq('category', category)
      if (game) query = query.eq('game', game)
      if (search) query = query.ilike('name', `%${search}%`)

      const { data, error } = await query
      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
      })
    }

    // POST /mods — create (requires auth)
    if (method === 'POST') {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

      const body = await req.json()
      const { data, error } = await supabase.from('mods').insert({
        ...body,
        user_id: user.id,
        download_count: 0
      }).select().single()

      if (error) throw error
      return new Response(JSON.stringify(data), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
