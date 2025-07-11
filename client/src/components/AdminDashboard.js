import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px');
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  // Access control: only admins allowed
  useEffect(() => {
    const role = atob(sessionStorage.getItem('authRole') || '');
    const exp = +sessionStorage.getItem('expiresAt') || 0;
    if (role !== 'admin' || Date.now() > exp) {
      alert('Unauthorized');
      navigate('/login');
    }
  }, [navigate]);

  // Settings persistence
  useEffect(() => {
    document.body.classList.toggle('dark-mode', dark);
    document.documentElement.style.fontSize = fontSize;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('fontSize', fontSize);
    return () => {
      document.body.classList.remove('dark-mode');
      document.documentElement.style.fontSize = '';
    };
  }, [dark, fontSize]);

  // Load submissions
  useEffect(() => {
    const storedSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    console.log('Loaded submissions:', storedSubmissions); // Debug log
    setSubmissions(storedSubmissions);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const refreshSubmissions = () => {
    const storedSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    console.log('Refreshed submissions:', storedSubmissions); // Debug log
    setSubmissions(storedSubmissions);
  };

  const addSampleData = () => {
    const sampleSubmissions = [
      {
        time: Date.now() - 3600000, // 1 hour ago
        user: 'john.doe',
        stage: 'Stage1',
        filename: 'john_doe_Stage1.pdf',
        notes: 'Initial submission'
      },
      {
        time: Date.now() - 7200000, // 2 hours ago
        user: 'jane.smith',
        stage: 'Stage2',
        filename: 'jane_smith_Stage2.pdf',
        notes: 'Reviewed by librarian'
      },
      {
        time: Date.now() - 10800000, // 3 hours ago
        user: 'bob.wilson',
        stage: 'Stage3',
        filename: 'bob_wilson_Stage3.pdf',
        notes: 'Final approval pending'
      }
    ];
    localStorage.setItem('submissions', JSON.stringify(sampleSubmissions));
    setSubmissions(sampleSubmissions);
  };

  // Add styles object at the top of the file
  const styles = {
    body: (dark, fontSize) => ({
      fontFamily: "'BentonSans Book', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      margin: 0,
      background: dark ? '#1e1e1e' : '#f1f1f1',
      color: dark ? '#fff' : '#201436',
      transition: 'background .3s,color .3s',
      fontSize,
      boxSizing: 'border-box',
    }),
    settingsBar: {
      position: 'fixed',
      top: 15,
      right: 20,
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      zIndex: 1000,
    },
    select: dark => ({
      fontFamily: "'BentonSans Book'",
      borderRadius: 4,
      border: '1px solid #ccc',
      padding: '.4rem 1rem',
      background: dark ? '#2e2e2e' : '#fff',
      color: dark ? '#fff' : '#201436',
      fontSize: '1rem',
      outline: 'none',
      transition: 'background .3s,color .3s',
    }),
    button: (dark, hover) => ({
      padding: '.5rem 1rem',
      border: 'none',
      background: '#4F2683',
      color: '#fff',
      borderRadius: 4,
      fontFamily: "'BentonSans Book'",
      fontWeight: 600,
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background .3s',
      outline: 'none',
      opacity: hover ? 0.85 : 1,
    }),
    container: dark => ({
      marginTop: 60,
      padding: '2rem',
      flex: 1,
      overflow: 'auto',
      background: 'none',
      borderRadius: 0,
      boxShadow: 'none',
      width: '100%',
      maxWidth: '100vw',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      boxSizing: 'border-box',
    }),
    h1: dark => ({
      fontFamily: "'BentonSans Bold'",
      textAlign: 'center',
      color: dark ? '#fff' : '#201436',
      fontSize: '2rem',
      margin: 0,
      marginBottom: '1.5rem',
      letterSpacing: '-1px',
      transition: 'color .3s',
    }),
    table: dark => ({
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
      background: 'none',
    }),
    th: dark => ({
      background: dark ? '#2e2e2e' : '#eee',
      color: dark ? '#fff' : '#201436',
      border: dark ? '1px solid #555' : '1px solid #ccc',
      padding: '.5rem',
      textAlign: 'left',
      fontWeight: 600,
      fontFamily: "'BentonSans Book'",
    }),
    td: (dark, empty) => ({
      background: 'none',
      color: dark ? '#fff' : '#201436',
      border: dark ? '1px solid #555' : '1px solid #ccc',
      padding: '.5rem',
      textAlign: 'left',
      fontFamily: "'BentonSans Book'",
      opacity: empty ? 0.7 : 1,
    }),
  };

  return (
    <div style={styles.body(dark, fontSize)}>
      {/* Global style to force fullscreen, no scrollbars, no white edges */}
      <style>{`
        html, body, #root {
          width: 100vw !important;
          height: 100vh !important;
          min-width: 0 !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: none !important;
          box-sizing: border-box !important;
        }
        body::-webkit-scrollbar, html::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>
      {/* Settings Bar */}
      <div style={styles.settingsBar}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />
          <span style={{ marginLeft: 6 }}>{dark ? '🌙' : '☀'}</span>
        </label>
        <select value={fontSize} onChange={e => setFontSize(e.target.value)} style={styles.select(dark)}>
          <option value="14px">Default</option>
          <option value="16px">Large</option>
          <option value="12px">Small</option>
        </select>
        <button onClick={refreshSubmissions} style={styles.button(dark, false)}>🔄 Refresh</button>
        <button onClick={addSampleData} style={styles.button(dark, false)}>📊 Sample Data</button>
        <button onClick={handleLogout} style={styles.button(dark, false)}>Logout</button>
      </div>
      {/* Main Card */}
      <div style={styles.container(dark)}>
        <h1 style={styles.h1(dark)}>Administrator Dashboard</h1>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={styles.table(dark)}>
            <thead>
              <tr>
                <th style={styles.th(dark)}>Time</th>
                <th style={styles.th(dark)}>User</th>
                <th style={styles.th(dark)}>Stage</th>
                <th style={styles.th(dark)}>Filename</th>
                <th style={styles.th(dark)}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr><td colSpan={5} style={styles.td(dark, true)}>No submissions yet.</td></tr>
              ) : (
                submissions.map((s, i) => (
                  <tr key={i}>
                    <td style={styles.td(dark)}>{new Date(s.time).toLocaleString()}</td>
                    <td style={styles.td(dark)}>{s.user}</td>
                    <td style={styles.td(dark)}>{s.stage}</td>
                    <td style={styles.td(dark)}>{s.filename}</td>
                    <td style={styles.td(dark)}>{s.notes || ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}