import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Gamepad2, Upload, LayoutDashboard, LogOut, LogIn } from 'lucide-react'
export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const handleSignOut = async () => { await signOut(); navigate('/') }
  const lk = {display:'flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:8,fontSize:14,fontWeight:500,color:'var(--text-muted)',background:'transparent',border:'none',cursor:'pointer',transition:'all .15s',fontFamily:'var(--font)'}
  return (
    <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(11,13,23,0.9)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--border)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link to="/" style={{display:'flex',alignItems:'center',gap:10,fontSize:18,fontWeight:700,color:'var(--accent)'}}>
          <Gamepad2 size={22} strokeWidth={2.5}/><span>Jenny's Mod</span>
        </Link>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <Link to="/browse" style={lk}>Browse</Link>
          {user ? (
            <>
              <Link to="/upload" style={lk}><Upload size={15}/>Upload</Link>
              <Link to="/dashboard" style={lk}><LayoutDashboard size={15}/>Dashboard</Link>
              <button onClick={handleSignOut} style={lk}><LogOut size={15}/>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={lk}><LogIn size={15}/>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{padding:'8px 16px'}}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
