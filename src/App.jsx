import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ModDetail from './pages/ModDetail'
import Upload from './pages/Upload'
import EditMod from './pages/EditMod'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/mod/:id" element={<ModDetail />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/edit/:id" element={<EditMod />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AuthProvider>
  )
}
