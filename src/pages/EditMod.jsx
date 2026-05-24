import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

const CATEGORIES = ['Gameplay','Graphics','Audio','UI','Weapons','Maps','Characters','Utility']
const GAMES = ['Minecraft','Skyrim','Cyberpunk 2077','Stardew Valley','Fallout 4','Other']

export default function EditMod() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('mods').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) return navigate('/dashboard')
      if (data.user_id !== user?.id) return navigate('/dashboard')
      setForm(data)
    })
  }, [id, user, navigate])

  if (!form) return <div className="page-center"><div className="spinner"/></div>
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const lbl = {fontSize:13,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6,display:'block'}

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('mods').update({
      name:form.name,description:form.description,category:form.category,
      game:form.game,game_version:form.game_version,version:form.version,changelog:form.changelog
    }).eq('id', id)
    setLoading(false)
    if (error) return toast.error('Save failed.')
    toast.success('Mod updated!')
    navigate(`/mod/${id}`)
  }

  return (
    <div className="container" style={{maxWidth:760,padding:'48px 24px'}}>
      <h1 style={{fontSize:28,fontWeight:700,marginBottom:32}}>Edit Mod</h1>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:24}}>
        <div><label style={lbl}>Mod Name</label><input value={form.name} onChange={e=>set('name',e.target.value)} required/></div>
        <div><label style={lbl}>Description</label><textarea rows={4} value={form.description||''} onChange={e=>set('description',e.target.value)}/></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div><label style={lbl}>Game</label><select value={form.game||''} onChange={e=>set('game',e.target.value)}>{GAMES.map(g=><option key={g}>{g}</option>)}</select></div>
          <div><label style={lbl}>Category</label><select value={form.category||''} onChange={e=>set('category',e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div><label style={lbl}>Game Version</label><input value={form.game_version||''} onChange={e=>set('game_version',e.target.value)}/></div>
          <div><label style={lbl}>Mod Version</label><input value={form.version||''} onChange={e=>set('version',e.target.value)}/></div>
        </div>
        <div><label style={lbl}>Changelog</label><textarea rows={3} value={form.changelog||''} onChange={e=>set('changelog',e.target.value)}/></div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{alignSelf:'flex-start',padding:'12px 28px'}}>
          <Save size={16}/>{loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
