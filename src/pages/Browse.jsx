import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import ModCard from '../components/ModCard'
import { Search, SlidersHorizontal } from 'lucide-react'

const CATEGORIES = ['All','Gameplay','Graphics','Audio','UI','Weapons','Maps','Characters','Utility']
const GAMES = ['All','Minecraft','Skyrim','Cyberpunk 2077','Stardew Valley','Elden Ring','Other']

export default function Browse() {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [game, setGame] = useState('All')
  const [sort, setSort] = useState('download_count')

  const fetchMods = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('mods').select('*').order(sort, { ascending: false })
    if (search) q = q.ilike('name', `%${search}%`)
    if (category !== 'All') q = q.eq('category', category)
    if (game !== 'All') q = q.eq('game', game)
    const { data } = await q.limit(48)
    setMods(data ?? [])
    setLoading(false)
  }, [search, category, game, sort])

  useEffect(() => { fetchMods() }, [fetchMods])

  return (
    <div className="container" style={{padding:'40px 24px'}}>
      <h1 style={{fontSize:28,fontWeight:700,marginBottom:24}}>Browse Mods</h1>

      <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <Search size={16} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',pointerEvents:'none'}}/>
          <input placeholder="Search mods..." value={search} onChange={e => setSearch(e.target.value)} style={{paddingLeft:38}}/>
        </div>
        <select value={game} onChange={e => setGame(e.target.value)} style={{width:'auto',minWidth:150}}>
          {GAMES.map(g => <option key={g}>{g}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{width:'auto',minWidth:165}}>
          <option value="download_count">Most Downloaded</option>
          <option value="created_at">Newest</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:28}}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding:'6px 16px',borderRadius:999,fontSize:13,fontWeight:500,cursor:'pointer',transition:'all .15s',
            background: category===c ? 'var(--accent)' : 'var(--surface)',
            border: `1px solid ${category===c ? 'var(--accent)' : 'var(--border)'}`,
            color: category===c ? '#fff' : 'var(--text-muted)'
          }}>{c}</button>
        ))}
      </div>

      {loading
        ? <div className="page-center"><div className="spinner"/></div>
        : mods.length === 0
          ? <div style={{textAlign:'center',padding:'80px 0',color:'var(--text-muted)',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
              <SlidersHorizontal size={40} opacity={0.3}/>
              <p>No mods found. Try different filters.</p>
            </div>
          : <>
              <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20,fontFamily:'var(--mono)'}}>{mods.length} mods found</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
                {mods.map(mod => <ModCard key={mod.id} mod={mod}/>)}
              </div>
            </>
      }
    </div>
  )
}
