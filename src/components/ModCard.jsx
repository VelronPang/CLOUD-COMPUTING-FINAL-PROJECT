import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'

export default function ModCard({ mod }) {
  const cover = mod.cover_image_url || `https://placehold.co/400x220/111827/6366f1?text=${encodeURIComponent(mod.name)}`
  return (
    <Link to={`/mod/${mod.id}`} className="card" style={{display:'flex',flexDirection:'column',overflow:'hidden',cursor:'pointer'}}>
      <div style={{width:'100%',height:160,backgroundImage:`url(${cover})`,backgroundSize:'cover',backgroundPosition:'center',backgroundColor:'var(--surface2)'}}/>
      <div style={{padding:16,flex:1,display:'flex',flexDirection:'column',gap:8}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {mod.category && <span className="badge badge-accent">{mod.category}</span>}
          {mod.game && <span className="badge badge-green">{mod.game}</span>}
        </div>
        <h3 style={{fontSize:15,fontWeight:700,lineHeight:1.3}}>{mod.name}</h3>
        <p style={{fontSize:13,color:'var(--text-muted)',flex:1}}>
          {mod.description?.slice(0,90)}{mod.description?.length > 90 ? '…' : ''}
        </p>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:4}}>
          <span style={{display:'flex',alignItems:'center',gap:5,fontSize:13,color:'var(--text-muted)',fontFamily:'var(--mono)'}}>
            <Download size={13}/>{mod.download_count ?? 0}
          </span>
          <span style={{fontSize:12,color:'var(--text-muted)'}}>by {mod.uploader_username ?? 'Unknown'}</span>
        </div>
      </div>
    </Link>
  )
}
