import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Download, Edit, Trash2, ArrowLeft, Calendar, User, Tag, Gamepad2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ModDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mod, setMod] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    supabase.from('mods').select('*, profiles(username,id)').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) navigate('/browse'); else setMod(data)
        setLoading(false)
      })
  }, [id, navigate])

  const handleDownload = async () => {
    if (!mod.file_url) return toast.error('No file attached to this mod.')
    setDownloading(true)
    await supabase.from('mods').update({ download_count: (mod.download_count ?? 0) + 1 }).eq('id', mod.id)
    await supabase.from('download_logs').insert({ mod_id: mod.id, user_id: user?.id ?? null })
    window.open(mod.file_url, '_blank')
    setMod(prev => ({ ...prev, download_count: (prev.download_count ?? 0) + 1 }))
    setDownloading(false)
    toast.success('Download started!')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this mod permanently?')) return
    const { error } = await supabase.from('mods').delete().eq('id', mod.id)
    if (error) return toast.error('Could not delete.')
    toast.success('Mod deleted.')
    navigate('/dashboard')
  }

  if (loading) return <div className="page-center"><div className="spinner"/></div>
  if (!mod) return null

  const isOwner = user?.id === mod.user_id
  const cover = mod.cover_image_url || 'https://placehold.co/1200x400/111827/cd7dff?text=JennysMod'
  const infoRows = [
    { icon: <User size={14}/>, val: mod.profiles?.username ?? 'Unknown' },
    { icon: <Gamepad2 size={14}/>, val: mod.game || '—' },
    { icon: <Tag size={14}/>, val: mod.category || '—' },
    { icon: <Calendar size={14}/>, val: new Date(mod.created_at).toLocaleDateString() },
    { icon: <Download size={14}/>, val: `${mod.download_count ?? 0} downloads`, mono: true },
  ]

  return (
    <div style={{paddingBottom:80}}>
      <div style={{height:280,backgroundImage:`url(${cover})`,backgroundSize:'cover',backgroundPosition:'center',position:'relative'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 30%,var(--bg))'}}/>
      </div>
      <div className="container">
        <Link to="/browse" style={{display:'inline-flex',alignItems:'center',gap:6,margin:'24px 0',color:'var(--text-muted)',fontSize:14,transition:'color .15s'}}>
          <ArrowLeft size={16}/> Back to Browse
        </Link>
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:40,alignItems:'start'}}>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,marginBottom:32}}>
              <div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
                  {mod.category && <span className="badge badge-accent">{mod.category}</span>}
                  {mod.game && <span className="badge badge-green">{mod.game}</span>}
                </div>
                <h1 style={{fontSize:32,fontWeight:700,letterSpacing:'-0.5px'}}>{mod.name}</h1>
              </div>
              {isOwner && (
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <Link to={`/edit/${mod.id}`} className="btn btn-ghost"><Edit size={15}/> Edit</Link>
                  <button onClick={handleDelete} className="btn btn-danger"><Trash2 size={15}/> Delete</button>
                </div>
              )}
            </div>
            <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:24,marginBottom:20}}>
              <p style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:12}}>About this mod</p>
              <p style={{color:'var(--text-muted)',lineHeight:1.8}}>{mod.description || 'No description provided.'}</p>
            </div>
            {mod.changelog && (
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:24}}>
                <p style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:12}}>Changelog</p>
                <pre style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--text-muted)',whiteSpace:'pre-wrap',lineHeight:1.7}}>{mod.changelog}</pre>
              </div>
            )}
          </div>
          <aside style={{display:'flex',flexDirection:'column',gap:16}}>
            <button onClick={handleDownload} disabled={downloading} className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:16}}>
              <Download size={18}/>{downloading ? 'Starting…' : 'Download Mod'}
            </button>
            <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:20,display:'flex',flexDirection:'column',gap:12}}>
              {infoRows.map((r,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,fontSize:14,color:'var(--text-muted)'}}>
                  {r.icon}<span style={{color:'var(--text)',fontFamily:r.mono?'var(--mono)':undefined}}>{r.val}</span>
                </div>
              ))}
            </div>
            {mod.version && (
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:20}}>
                <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:4}}>MOD VERSION</p>
                <p style={{fontFamily:'var(--mono)',fontSize:16,color:'var(--accent)'}}>{mod.version}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
