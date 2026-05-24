import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Upload as UploadIcon, Image, FileArchive } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Gameplay','Graphics','Audio','UI','Weapons','Maps','Characters','Utility']
const GAMES = ['Minecraft','Skyrim','Cyberpunk 2077','Stardew Valley','Fallout 4','Other']

export default function Upload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'',description:'',category:'Gameplay',game:'Minecraft',game_version:'',version:'1.0.0',changelog:'' })
  const [coverFile, setCoverFile] = useState(null)
  const [modFile, setModFile] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!user) return (
    <div className="page-center">
      <div style={{textAlign:'center'}}>
        <h2 style={{marginBottom:12}}>Sign in to upload mods</h2>
        <a href="/login" className="btn btn-primary">Go to Login</a>
      </div>
    </div>
  )

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const lbl = {fontSize:13,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6,display:'block'}

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required.')
    setLoading(true)
    let cover_image_url = null
    let file_url = null
    try {
      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const path = `covers/${user.id}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('mod-assets').upload(path, coverFile)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('mod-assets').getPublicUrl(path)
        cover_image_url = publicUrl
      }
      if (modFile) {
        const ext = modFile.name.split('.').pop()
        const path = `mods/${user.id}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('mod-assets').upload(path, modFile)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('mod-assets').getPublicUrl(path)
        file_url = publicUrl
      }
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()

const { data, error } = await supabase.from('mods').insert({
  ...form,
  user_id: user.id,
  uploader_username: profile?.username ?? user.email.split('@')[0],
  cover_image_url,
  file_url,
  download_count: 0
}).select().single()
      if (error) throw error
      toast.success('Mod uploaded!')
      navigate(`/mod/${data.id}`)
    } catch (err) {
      toast.error(err.message || 'Upload failed.')
      setLoading(false)
    }
  }

  const DropZone = ({ id, file, setFile, accept, label, hint }) => (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{border:'2px dashed var(--border)',borderRadius:'var(--radius)',padding:20,textAlign:'center',background:'var(--surface2)',cursor:'pointer',transition:'border-color .2s'}}
        onClick={() => document.getElementById(id).click()}
        onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
        <input id={id} type="file" accept={accept} style={{display:'none'}} onChange={e => setFile(e.target.files[0])}/>
        {file
          ? <p style={{color:'var(--accent2)',fontSize:13,wordBreak:'break-all'}}>{file.name}</p>
          : <p style={{color:'var(--text-muted)',fontSize:13}}>Click to select file<br/><span style={{fontSize:11,opacity:.7}}>{hint}</span></p>
        }
      </div>
    </div>
  )

  return (
    <div className="container" style={{maxWidth:760,padding:'48px 24px'}}>
      <h1 style={{fontSize:28,fontWeight:700,marginBottom:8}}>Upload a Mod</h1>
      <p style={{color:'var(--text-muted)',marginBottom:36}}>Share your creation with the community.</p>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:24}}>
        <div><label style={lbl}>Mod Name *</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="My Awesome Mod" required/></div>
        <div><label style={lbl}>Description</label><textarea rows={4} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Describe what your mod does..."/></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div><label style={lbl}>Game</label>
            <select value={form.game} onChange={e=>set('game',e.target.value)}>{GAMES.map(g=><option key={g}>{g}</option>)}</select>
          </div>
          <div><label style={lbl}>Category</label>
            <select value={form.category} onChange={e=>set('category',e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div><label style={lbl}>Game Version</label><input value={form.game_version} onChange={e=>set('game_version',e.target.value)} placeholder="e.g. 1.21"/></div>
          <div><label style={lbl}>Mod Version</label><input value={form.version} onChange={e=>set('version',e.target.value)} placeholder="e.g. 1.0.0"/></div>
        </div>
        <div><label style={lbl}>Changelog</label><textarea rows={3} value={form.changelog} onChange={e=>set('changelog',e.target.value)} placeholder="What changed in this version?"/></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <DropZone id="cover-input" file={coverFile} setFile={setCoverFile} accept="image/*" label="Cover Image" hint="PNG, JPG, WebP"/>
          <DropZone id="mod-input" file={modFile} setFile={setModFile} accept=".zip,.jar,.rar,.7z,.pak" label="Mod File" hint=".zip .jar .pak .7z"/>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{alignSelf:'flex-start',padding:'12px 32px',fontSize:15}}>
          <UploadIcon size={17}/>{loading ? 'Uploading…' : 'Publish Mod'}
        </button>
      </form>
    </div>
  )
}
