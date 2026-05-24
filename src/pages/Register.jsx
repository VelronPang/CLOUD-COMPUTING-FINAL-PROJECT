import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Gamepad2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  // We keep useAuth() here in case other parts of your app rely on it initializing
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters.')
    setLoading(true)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: null 
      }
    })

    if (error) { 
      setLoading(false)
      return toast.error(error.message) 
    }
    
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, username, email })
    }
    
    setLoading(false)
    // Updated toast text since they are logged in instantly now
    toast.success('Account created successfully!') 
    navigate('/')
  }

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',padding:'0 24px'}}>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'40px 36px',width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <Gamepad2 size={32} color="var(--accent)" style={{marginBottom:12}}/>
          <h1 style={{fontSize:24,fontWeight:700}}>Join Jenny's Mod</h1>
          <p style={{color:'var(--text-muted)',fontSize:14,marginTop:6}}>Create your free account</p>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:6}}>Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="coolmodder123" required/>
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:6}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/>
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:6}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters" required/>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:13,marginTop:8}}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p style={{textAlign:'center',fontSize:14,color:'var(--text-muted)',marginTop:24}}>
          Already have an account? <Link to="/login" style={{color:'var(--accent)',fontWeight:600}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}