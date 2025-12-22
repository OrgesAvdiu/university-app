import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard({ api }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('faculties')
  const [faculties, setFaculties] = useState([])
  const [subjects, setSubjects] = useState([])
  const [professors, setProfessors] = useState([])
  const [students, setStudents] = useState([])
  const [form, setForm] = useState(null)

  useEffect(() => {
    loadFaculties()
    loadSubjects()
    loadProfessors()
    loadStudents()
  }, [])

  const loadFaculties = () => api.get('/faculties/').then(r => setFaculties(r.data))
  const loadSubjects = () => api.get('/subjects/').then(r => setSubjects(r.data))
  const loadProfessors = () => api.get('/professors/').then(r => setProfessors(r.data))
  const loadStudents = () => api.get('/students/').then(r => setStudents(r.data))

  const logout = () => {
    localStorage.removeItem('token')
    if (api?.defaults?.headers?.common) delete api.defaults.headers.common['Authorization']
    navigate('/login')
  }

  const deleteFaculty = (id) => {
    if (!confirm('Delete this faculty?')) return
    api.delete(`/faculties/${id}/`).then(() => loadFaculties())
  }

  const deleteSubject = (id) => {
    if (!confirm('Delete this subject?')) return
    api.delete(`/subjects/${id}/`).then(() => loadSubjects())
  }

  const deleteProfessor = (id) => {
    if (!confirm('Delete this professor?')) return
    api.delete(`/professors/${id}/`).then(() => loadProfessors())
  }

  const deleteStudent = (id) => {
    if (!confirm('Delete this student?')) return
    api.delete(`/students/${id}/`).then(() => loadStudents())
  }

  const saveFaculty = (e) => {
    e.preventDefault()
    const payload = { name: form.name }
    const req = form.id ? api.put(`/faculties/${form.id}/`, payload) : api.post('/faculties/', payload)
    req.then(() => { loadFaculties(); setForm(null) })
  }

  const saveSubject = (e) => {
    e.preventDefault()
    const payload = { code: form.code, title: form.title, faculty: form.faculty, professor: form.professor }
    const req = form.id ? api.put(`/subjects/${form.id}/`, payload) : api.post('/subjects/', payload)
    req.then(() => { loadSubjects(); setForm(null) })
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
      marginBottom: '32px'
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
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '8px'
    },
    tab: {
      padding: '12px 24px',
      background: 'transparent',
      border: 'none',
      borderRadius: '8px 8px 0 0',
      fontSize: '15px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      color: '#666'
    },
    activeTab: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    addBtn: {
      padding: '12px 24px',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '16px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px'
    },
    th: {
      background: '#f9fafb',
      padding: '12px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151',
      borderBottom: '2px solid #e5e7eb'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #e5e7eb'
    },
    form: {
      marginTop: '16px',
      padding: '24px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      background: '#f9fafb'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '2px solid #e5e7eb',
      borderRadius: '6px',
      fontSize: '14px',
      marginTop: '4px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '4px'
    },
    editBtn: {
      padding: '6px 16px',
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      marginRight: '8px',
      cursor: 'pointer'
    },
    deleteBtn: {
      padding: '6px 16px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      cursor: 'pointer'
    },
    saveBtn: {
      padding: '10px 24px',
      background: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      marginRight: '8px',
      cursor: 'pointer'
    },
    cancelBtn: {
      padding: '10px 24px',
      background: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>👨‍💼 Administrator Dashboard</h2>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>

        <div style={styles.tabs}>
          <button onClick={() => setTab('faculties')} style={{...styles.tab, ...(tab === 'faculties' ? styles.activeTab : {})}}>Faculties</button>
          <button onClick={() => setTab('subjects')} style={{...styles.tab, ...(tab === 'subjects' ? styles.activeTab : {})}}>Subjects</button>
          <button onClick={() => setTab('professors')} style={{...styles.tab, ...(tab === 'professors' ? styles.activeTab : {})}}>Professors</button>
          <button onClick={() => setTab('students')} style={{...styles.tab, ...(tab === 'students' ? styles.activeTab : {})}}>Students</button>
        </div>

        {tab === 'faculties' && (
          <div>
            <h3 style={{ marginBottom: '16px', color: '#374151' }}>Faculties</h3>
            <button style={styles.addBtn} onClick={() => setForm({ name: '' })}>+ Add Faculty</button>
            {form?.name !== undefined && (
              <form onSubmit={saveFaculty} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Faculty Name</label>
                  <input style={styles.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <button type="submit" style={styles.saveBtn}>Save</button>
                <button type="button" style={styles.cancelBtn} onClick={() => setForm(null)}>Cancel</button>
              </form>
            )}
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Actions</th></tr></thead>
              <tbody>
                {faculties.map(f => (
                  <tr key={f.id}>
                    <td style={styles.td}>{f.id}</td>
                    <td style={styles.td}>{f.name}</td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => setForm({id: f.id, name: f.name})}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => deleteFaculty(f.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'subjects' && (
          <div>
            <h3 style={{ marginBottom: '16px', color: '#374151' }}>Subjects</h3>
            <button style={styles.addBtn} onClick={() => setForm({ code: '', title: '', faculty: '', professor: '' })}>+ Add Subject</button>
            {form?.code !== undefined && (
              <form onSubmit={saveSubject} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Code</label>
                  <input style={styles.input} value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title</label>
                  <input style={styles.input} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Faculty</label>
                  <select style={styles.input} value={form.faculty} onChange={e => setForm({...form, faculty: e.target.value})} required>
                    <option value="">--Select--</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Professor</label>
                  <select style={styles.input} value={form.professor} onChange={e => setForm({...form, professor: e.target.value})}>
                    <option value="">--None--</option>
                    {professors.map(p => <option key={p.id} value={p.id}>{p.user.username}</option>)}
                  </select>
                </div>
                <button type="submit" style={styles.saveBtn}>Save</button>
                <button type="button" style={styles.cancelBtn} onClick={() => setForm(null)}>Cancel</button>
              </form>
            )}
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Code</th><th style={styles.th}>Title</th><th style={styles.th}>Faculty</th><th style={styles.th}>Professor</th><th style={styles.th}>Actions</th></tr></thead>
              <tbody>
                {subjects.map(s => (
                  <tr key={s.id}>
                    <td style={styles.td}>{s.code}</td>
                    <td style={styles.td}>{s.title}</td>
                    <td style={styles.td}>{s.faculty?.name}</td>
                    <td style={styles.td}>{s.professor?.user.username || 'N/A'}</td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => setForm({id: s.id, code: s.code, title: s.title, faculty: s.faculty?.id, professor: s.professor?.id || ''})}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => deleteSubject(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'professors' && (
          <div>
            <h3 style={{ marginBottom: '16px', color: '#374151' }}>Professors</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>Create professors via Django admin (User + Professor profile).</p>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Username</th><th style={styles.th}>Name</th><th style={styles.th}>Faculty</th><th style={styles.th}>Office</th><th style={styles.th}>Actions</th></tr></thead>
              <tbody>
                {professors.map(p => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.id}</td>
                    <td style={styles.td}>{p.user.username}</td>
                    <td style={styles.td}>{p.user.first_name} {p.user.last_name}</td>
                    <td style={styles.td}>{p.faculty?.name || 'N/A'}</td>
                    <td style={styles.td}>{p.office}</td>
                    <td style={styles.td}><button style={styles.deleteBtn} onClick={() => deleteProfessor(p.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'students' && (
          <div>
            <h3 style={{ marginBottom: '16px', color: '#374151' }}>Students</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>Create students via Django admin (User + Student profile).</p>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Username</th><th style={styles.th}>Name</th><th style={styles.th}>Faculty</th><th style={styles.th}>Enrollment Year</th><th style={styles.th}>Actions</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={styles.td}>{s.id}</td>
                    <td style={styles.td}>{s.user.username}</td>
                    <td style={styles.td}>{s.user.first_name} {s.user.last_name}</td>
                    <td style={styles.td}>{s.faculty?.name || 'N/A'}</td>
                    <td style={styles.td}>{s.enrollment_year}</td>
                    <td style={styles.td}><button style={styles.deleteBtn} onClick={() => deleteStudent(s.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
