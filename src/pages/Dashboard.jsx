import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Edit, Trash2, Download, Plus, Gamepad2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [mods, setMods] = useState([])
  const [stats, setStats] = useState({ totalDownloads:0, totalMods:0 })
  const [loading, setLoading] = useState(true)

  const fetchMods = async () => {
    if (!user) return
    const { data } = await supabase.from('mods').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    const list = data ?? []
    setMods(list)
    setStats({ totalMods: list.length, totalDownloads: list.reduce((s,m) => s + (m.download_count ?? 0), 0) })
    setLoading(false)
  }

  useEffect(() => { fetchMods() }, [user])

  const handleDelete = async (id) => {
    if (!confirm('Delete this mod?')) return
    await supabase.from('mods').delete().eq('id', id)
    toast.success('Deleted.')
    fetchMods()
  }

  if (!user) return (
    <div className="page-center">
      <div style={{textAlign:'center'}}>
        <h2 style={{marginBottom:12}}>Sign in to view your dashboard</h2>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    </div>
  )
  if (loading) return <div className="page-center"><div className="spinner"/></div>

  const StatBox = ({ label, value, color='var(--accent)' }) => (
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'24px 28px'}}>
      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</p>
      <p style={{fontSize:36,fontWeight:700,color,fontFamily:'var(--mono)'}}>{value}</p>
    </div>
  )

  return (
    <div className="container" style={{padding:'48px 24px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:36}}>
        <div>
          <h1 style={{fontSize:28,fontWeight:700}}>My Dashboard</h1>
          <p style={{color:'var(--text-muted)',marginTop:4,fontSize:14}}>{user.email}</p>
        </div>
        <Link to="/upload" className="btn btn-primary"><Plus size={16}/>Upload Mod</Link>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:40}}>
        <StatBox label="Total Mods" value={stats.totalMods}/>
        <StatBox label="Total Downloads" value={stats.totalDownloads} color="var(--accent2)"/>
      </div>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:20}}>Your Mods</h2>
      {mods.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px 0',color:'var(--text-muted)',display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
          <Gamepad2 size={48} opacity={0.3}/>
          <p>You haven't uploaded any mods yet.</p>
          <Link to="/upload" className="btn btn-primary"><Plus size={15}/>Upload your first mod</Link>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {mods.map(mod => (
            <div key={mod.id} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px 20px',display:'flex',alignItems:'center',gap:16,justifyContent:'space-between',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:200}}>
                <Link to={`/mod/${mod.id}`} style={{fontWeight:600,fontSize:15}}>{mod.name}</Link>
                <div style={{display:'flex',gap:12,marginTop:6,alignItems:'center',flexWrap:'wrap'}}>
                  <span className="badge badge-accent">{mod.category}</span>
                  <span style={{fontSize:13,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4,fontFamily:'var(--mono)'}}><Download size={13}/>{mod.download_count ?? 0}</span>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(mod.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <Link to={`/edit/${mod.id}`} className="btn btn-ghost" style={{padding:'7px 14px',fontSize:13}}><Edit size={14}/>Edit</Link>
                <button onClick={() => handleDelete(mod.id)} className="btn btn-danger" style={{padding:'7px 14px',fontSize:13}}><Trash2 size={14}/>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
