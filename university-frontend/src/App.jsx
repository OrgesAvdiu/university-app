import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ProfessorDashboard from './pages/ProfessorDashboard'

const api = axios.create({ baseURL: 'http://localhost:8000/api' })

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [role, setRole] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    api.get('/me/profile/').then(res => {
      setRole(res.data.role)
    }).catch(() => {
      localStorage.removeItem('token')
      navigate('/login')
    })
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<Login api={api} onLogin={(tok) => {
        localStorage.setItem('token', tok)
        api.defaults.headers.common['Authorization'] = `Bearer ${tok}`
        api.get('/me/profile/').then(res => {
          const r = res.data.role
          setRole(r)
          if (r === 'administrator') navigate('/admin')
          else if (r === 'student') navigate('/student')
          else if (r === 'professor') navigate('/professor')
          else navigate('/login')
        })
      }} />} />

      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard api={api} />
        </ProtectedRoute>
      } />

      <Route path="/student" element={
        <ProtectedRoute>
          <StudentDashboard api={api} />
        </ProtectedRoute>
      } />

      <Route path="/professor" element={
        <ProtectedRoute>
          <ProfessorDashboard api={api} />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
