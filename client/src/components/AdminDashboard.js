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
    setSubmissions(JSON.parse(localStorage.getItem('submissions') || '[]'));
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
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
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} style={{ display: 'none' }} />
          <span style={styles.slider(dark)}>
            <span style={styles.sliderBefore(dark)}>{dark ? '🌙' : '☀'}</span>
          </span>
        </label>
        <select value={fontSize} onChange={e => setFontSize(e.target.value)} style={styles.select(dark)}>
          <option value="14px">Default</option>
          <option value="16px">Large</option>
          <option value="12px">Small</option>
        </select>
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