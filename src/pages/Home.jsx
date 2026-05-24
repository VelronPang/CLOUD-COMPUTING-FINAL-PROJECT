import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ModCard from '../components/ModCard'
import { Gamepad2, ArrowRight, Upload, Shield, Zap } from 'lucide-react'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from('mods').select('*, profiles(username)')
      .order('download_count', { ascending: false }).limit(6)
      .then(({ data }) => { setFeatured(data ?? []); setLoading(false) })
  }, [])
  const features = [
    { icon: <Upload size={22}/>, title: 'Easy Uploading', desc: 'Upload mod files and cover images in seconds. Stored securely in Supabase cloud storage.' },
    { icon: <Shield size={22}/>, title: 'Community Moderated', desc: 'Community-reviewed mods. Report bad content to keep the platform safe for everyone.' },
    { icon: <Zap size={22}/>, title: 'Fast CDN Delivery', desc: 'Files served via global CDN. Downloads are fast no matter where in the world you are.' },
  ]
  return (
    <div>
      <section style={{position:'relative',padding:'100px 0 80px',borderBottom:'1px solid var(--border)',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-200,left:'50%',transform:'translateX(-50%)',width:700,height:500,background:'radial-gradient(ellipse,rgba(99,102,241,.18) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div className="container" style={{textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.3)',color:'var(--accent)',padding:'5px 14px',borderRadius:999,fontSize:12,fontWeight:600,letterSpacing:'.05em',textTransform:'uppercase',marginBottom:24}}>
            <Gamepad2 size={13}/> The Open Mod Platform
          </div>
          <h1 style={{fontSize:'clamp(36px,6vw,62px)',fontWeight:700,lineHeight:1.1,letterSpacing:'-1px',marginBottom:20}}>
            Share, Download &<br/>
            <span style={{background:'linear-gradient(135deg,var(--accent),var(--accent2))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              Discover Game Mods
            </span>
          </h1>
          <p style={{fontSize:17,color:'var(--text-muted)',maxWidth:520,margin:'0 auto 36px'}}>
            Jenny's Mod is a community-driven platform to upload, browse, and download mods for your favourite games — completely free, forever.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/browse" className="btn btn-primary">Browse Mods <ArrowRight size={16}/></Link>
            <Link to="/upload" className="btn btn-ghost">Upload a Mod <Upload size={16}/></Link>
          </div>
        </div>
      </section>
      <section style={{padding:'64px 0',borderBottom:'1px solid var(--border)'}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:24}}>
            {features.map(f => (
              <div key={f.title} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:28}}>
                <div style={{color:'var(--accent)',marginBottom:12}}>{f.icon}</div>
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>{f.title}</h3>
                <p style={{fontSize:14,color:'var(--text-muted)'}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{padding:'64px 0'}}>
        <div className="container">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:32}}>
            <h2 style={{fontSize:24,fontWeight:700}}>Most Downloaded</h2>
            <Link to="/browse" className="btn btn-ghost">View All <ArrowRight size={14}/></Link>
          </div>
          {loading
            ? <div className="page-center"><div className="spinner"/></div>
            : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
                {featured.map(mod => <ModCard key={mod.id} mod={mod}/>)}
              </div>
          }
        </div>
      </section>
    </div>
  )
}
