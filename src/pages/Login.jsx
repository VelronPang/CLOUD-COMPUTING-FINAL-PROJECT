import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Gamepad2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Welcome back!')
    navigate('/')
  }

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',padding:'0 24px'}}>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'40px 36px',width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <Gamepad2 size={32} color="var(--accent)" style={{marginBottom:12}}/>
          <h1 style={{fontSize:24,fontWeight:700}}>Welcome back</h1>
          <p style={{color:'var(--text-muted)',fontSize:14,marginTop:6}}>Sign in to your Jenny's Mod account</p>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:6}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/>
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:6}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:13,marginTop:8}}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{textAlign:'center',fontSize:14,color:'var(--text-muted)',marginTop:24}}>
          Don't have an account? <Link to="/register" style={{color:'var(--accent)',fontWeight:600}}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
