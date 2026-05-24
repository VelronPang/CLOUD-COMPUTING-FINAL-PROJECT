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

  const { mod_id, user_id } = await req.json()
  if (!mod_id) return new Response('mod_id required', { status: 400, headers: corsHeaders })

  // Increment download_count atomically using RPC
  const { error: rpcError } = await supabase.rpc('increment_download', { mod_id_input: mod_id })

  // Log the download event for observability
  const { error: logError } = await supabase.from('download_logs').insert({
    mod_id,
    user_id: user_id || null,
  })

  if (rpcError || logError) {
    console.error('Track error:', rpcError, logError)
    return new Response(JSON.stringify({ error: 'tracking failed' }), { status: 500, headers: corsHeaders })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
