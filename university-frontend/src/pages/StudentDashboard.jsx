import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function StudentDashboard({ api }) {
  const [subjects, setSubjects] = useState([])
  const [profile, setProfile] = useState(null)
  const [busyIds, setBusyIds] = useState([])
  const [filterMode, setFilterMode] = useState('all') // 'all' or 'enrolled'
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    if (api && api.defaults && api.defaults.headers && api.defaults.headers.common) {
      delete api.defaults.headers.common['Authorization']
    }
    navigate('/login')
  }

  const loadData = async () => {
    const [subs, me] = await Promise.all([
      api.get('/subjects/'),
      api.get('/me/profile/')
    ])
    setSubjects(subs.data)
    setProfile(me.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const toggleEnroll = async (subject) => {
    const id = subject.id
    try {
      setBusyIds(prev => [...prev, id])
      if (subject.enrolled) {
        await api.post(`/subjects/${id}/unenroll/`)
      } else {
        await api.post(`/subjects/${id}/enroll/`)
      }
      await loadData()
    } finally {
      setBusyIds(prev => prev.filter(x => x !== id))
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      padding: '32px',
      marginBottom: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#333',
      margin: 0
    },
    logoutBtn: {
      padding: '10px 24px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    profileCard: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '24px'
    },
    filterBar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px'
    },
    filterBtn: (active) => ({
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      background: active ? '#667eea' : '#e5e7eb',
      color: active ? 'white' : '#374151',
      transition: 'all 0.2s'
    }),
    subjectCard: {
      background: '#f9fafb',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '16px',
      border: '2px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      gap: '16px',
      alignItems: 'center'
    },
    subjectInfo: { flex: 1 },
    subjectTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    enrollBtn: (enrolled, disabled) => ({
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: 'white',
      background: enrolled ? '#ef4444' : '#10b981',
      opacity: disabled ? 0.7 : 1,
      minWidth: '120px',
      fontWeight: 700
    })
  }

  const filtered = filterMode === 'enrolled' ? subjects.filter(s => s.enrolled) : subjects

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>🎓 Student Dashboard</h2>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
        {profile && (
          <div style={styles.profileCard}>
            <strong style={{ fontSize: '18px' }}>{profile.user.first_name} {profile.user.last_name}</strong>
            <div style={{ opacity: 0.9, marginTop: '4px' }}>@{profile.user.username}</div>
            <div style={{ marginTop: '8px' }}>📚 Faculty: {profile.profile?.faculty?.name || 'N/A'}</div>
            <div style={{ marginTop: '4px' }}>📅 Enrollment Year: {profile.profile?.enrollment_year || 'N/A'}</div>
          </div>
        )}
        <div style={styles.filterBar}>
          <button 
            style={styles.filterBtn(filterMode === 'all')} 
            onClick={() => setFilterMode('all')}
          >
            All Subjects ({subjects.length})
          </button>
          <button 
            style={styles.filterBtn(filterMode === 'enrolled')} 
            onClick={() => setFilterMode('enrolled')}
          >
            My Subjects ({subjects.filter(s => s.enrolled).length})
          </button>
        </div>
        {filtered.length === 0 && <p style={{ color: '#6b7280' }}>No subjects {filterMode === 'enrolled' ? 'enrolled' : 'available'}.</p>}
        {filtered.map(s => (
          <div key={s.id} style={styles.subjectCard}>
            <div style={styles.subjectInfo}>
              <h4 style={styles.subjectTitle}>{s.code} - {s.title}</h4>
              <p style={{ color: '#6b7280', margin: '4px 0' }}>Faculty: {s.faculty?.name}</p>
              <p style={{ color: '#6b7280', margin: '4px 0' }}>👨‍🏫 Professor: {s.professor ? `${s.professor.user.first_name} ${s.professor.user.last_name}` : 'N/A'}</p>
            </div>
            <button
              style={styles.enrollBtn(s.enrolled, busyIds.includes(s.id))}
              onClick={() => toggleEnroll(s)}
              disabled={busyIds.includes(s.id)}
            >
              {s.enrolled ? 'Unenroll' : 'Enroll'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
