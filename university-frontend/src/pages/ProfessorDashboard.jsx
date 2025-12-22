import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProfessorDashboard({ api }) {
  const [subjects, setSubjects] = useState([])
  const [profile, setProfile] = useState(null)
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [grades, setGrades] = useState({})
  const [savingGrades, setSavingGrades] = useState({})
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    if (api && api.defaults && api.defaults.headers && api.defaults.headers.common) {
      delete api.defaults.headers.common['Authorization']
    }
    navigate('/login')
  }

  const loadSubjects = async () => {
    const res = await api.get('/subjects/')
    setSubjects(res.data)
  }

  const loadGradesForSubject = async (subjectId) => {
    try {
      const res = await api.get(`/grades/by_subject/?subject_id=${subjectId}`)
      setGrades(prev => ({ ...prev, [subjectId]: res.data }))
    } catch (err) {
      console.error('Error loading grades:', err)
    }
  }

  useEffect(() => {
    loadSubjects()
    api.get('/me/profile/').then(res => setProfile(res.data))
  }, [])

  const handleExpandSubject = (subjectId) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId)
    if (expandedSubject !== subjectId && !grades[subjectId]) {
      loadGradesForSubject(subjectId)
    }
  }

  const handleGradeChange = (subjectId, studentId, value) => {
    setGrades(prev => ({
      ...prev,
      [subjectId]: prev[subjectId].map(g =>
        g.student.id === studentId ? { ...g, grade: value === '' ? null : parseFloat(value) } : g
      )
    }))
  }

  const handleSaveGrade = async (subjectId, grade) => {
    const key = `${subjectId}-${grade.student.id}`
    setSavingGrades(prev => ({ ...prev, [key]: true }))
    try {
      if (grade.id) {
        await api.patch(`/grades/${grade.id}/`, { grade: grade.grade, notes: grade.notes })
      } else {
        await api.post('/grades/', {
          subject: subjectId,
          student_id: grade.student.id,
          grade: grade.grade,
          notes: grade.notes
        })
      }
      await loadGradesForSubject(subjectId)
    } catch (err) {
      console.error('Error saving grade:', err)
    } finally {
      setSavingGrades(prev => ({ ...prev, [key]: false }))
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '24px'
    },
    subjectCard: {
      background: '#f9fafb',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '16px',
      border: '2px solid #e5e7eb'
    },
    subjectTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px',
      cursor: 'pointer',
      userSelect: 'none'
    },
    expandBtn: {
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: '12px',
      marginTop: '8px'
    },
    gradeTable: {
      width: '100%',
      marginTop: '16px',
      borderCollapse: 'collapse'
    },
    gradeTh: {
      textAlign: 'left',
      padding: '8px',
      background: '#e5e7eb',
      fontWeight: '600',
      color: '#374151'
    },
    gradeTd: {
      padding: '8px',
      borderBottom: '1px solid #d1d5db',
      color: '#555'
    },
    gradeInput: {
      padding: '6px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      width: '80px'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>👨‍🏫 Professor Dashboard</h2>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
        {profile && (
          <div style={styles.profileCard}>
            <strong style={{ fontSize: '18px' }}>{profile.user.first_name} {profile.user.last_name}</strong>
            <div style={{ opacity: 0.9, marginTop: '4px' }}>@{profile.user.username}</div>
            <div style={{ marginTop: '8px' }}>📚 Faculty: {profile.profile?.faculty?.name || 'N/A'}</div>
          </div>
        )}
        <h3 style={{ marginBottom: '16px', color: '#374151' }}>Subjects I Teach</h3>
        {subjects.length === 0 && <p style={{ color: '#6b7280' }}>No subjects assigned.</p>}
        {subjects.map(s => (
          <div key={s.id} style={styles.subjectCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={styles.subjectTitle}>{s.code} - {s.title}</h4>
              <button style={styles.expandBtn} onClick={() => handleExpandSubject(s.id)}>
                {expandedSubject === s.id ? 'Hide Grades' : 'Manage Grades'}
              </button>
            </div>
            <p style={{ color: '#6b7280', margin: '4px 0' }}>Faculty: {s.faculty?.name}</p>
            <p style={{ fontWeight: '600', marginTop: '12px', color: '#374151' }}>Enrolled Students: {s.students?.length || 0}</p>
            
            {expandedSubject === s.id && (
              <>
                {grades[s.id] && grades[s.id].length > 0 ? (
                  <table style={styles.gradeTable}>
                    <thead>
                      <tr>
                        <th style={styles.gradeTh}>Student Name</th>
                        <th style={styles.gradeTh}>Username</th>
                        <th style={styles.gradeTh}>Grade</th>
                        <th style={styles.gradeTh}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades[s.id].map(g => (
                        <tr key={g.student.id}>
                          <td style={styles.gradeTd}>{g.student.user.first_name} {g.student.user.last_name}</td>
                          <td style={styles.gradeTd}>{g.student.user.username}</td>
                          <td style={styles.gradeTd}>
                            <input
                              style={styles.gradeInput}
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={g.grade || ''}
                              onChange={(e) => handleGradeChange(s.id, g.student.id, e.target.value)}
                              placeholder="Grade"
                            />
                          </td>
                          <td style={styles.gradeTd}>
                            <button
                              onClick={() => handleSaveGrade(s.id, g)}
                              disabled={savingGrades[`${s.id}-${g.student.id}`]}
                              style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                cursor: 'pointer'
                              }}
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>Loading grades...</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
