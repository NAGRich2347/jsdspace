import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ManualControls component for admin-only workflow simulation and log.
 */
export default function ManualControls() {
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px');
  const [confirmOn, setConfirmOn] = useState(localStorage.getItem('confirmOn') !== 'false');
  const [log, setLog] = useState([]);
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
    localStorage.setItem('confirmOn', confirmOn);
    return () => {
      document.body.classList.remove('dark-mode');
      document.documentElement.style.fontSize = '';
    };
  }, [dark, fontSize, confirmOn]);

  // Load workflow log
  useEffect(() => {
    setLog(JSON.parse(localStorage.getItem('workflowLog') || '[]'));
  }, []);

  // Add to workflow log
  const addLog = (msg) => {
    const newLog = [...log, msg];
    setLog(newLog);
    localStorage.setItem('workflowLog', JSON.stringify(newLog));
  };

  // Simulate workflow navigation
  const goTo = (route, label) => {
    if (confirmOn && !window.confirm('Go there?')) return;
    addLog(`Simulated: ${label} at ${new Date().toLocaleString()}`);
    navigate(route);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const styles = {
    body: (dark, fontSize) => ({
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: dark ? 'linear-gradient(to bottom, #1a1a2e, #0f3460)' : 'linear-gradient(to bottom, #f0f2f5, #d6e4ff)',
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: fontSize,
    }),
    settingsBar: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      zIndex: 10,
    },
    slider: (dark) => ({
      position: 'relative',
      width: '40px',
      height: '20px',
      backgroundColor: dark ? '#e0d6f7' : '#201436',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2px',
    }),
    sliderBefore: (dark) => ({
      content: '""',
      position: 'absolute',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: dark ? '#e0d6f7' : '#201436',
      top: '2px',
      left: dark ? 'calc(100% - 18px)' : '2px',
      transition: '0.3s',
    }),
    select: (dark) => ({
      padding: '8px 12px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: dark ? '#201436' : '#f0f2f5',
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: '14px',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22%3E%3Cpolygon points=%220,0 10,0 5,10%22 fill=%22%23e0d6f7%22/%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '10px',
    }),
    button: (dark, isPrimary) => ({
      padding: '10px 20px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: isPrimary ? '#4f46e5' : dark ? '#201436' : '#e0d6f7',
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      '&:hover': {
        backgroundColor: isPrimary ? '#6366f1' : dark ? '#3730a3' : '#d6e4ff',
      },
    }),
    h1: (dark) => ({
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
      color: dark ? '#e0d6f7' : '#201436',
    }),
    container: (dark) => ({
      width: '100%',
      maxWidth: '500px',
      padding: '20px',
      backgroundColor: dark ? '#1a1a2e' : '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: fontSize,
    }),
    log: (dark) => ({
      marginTop: '20px',
      padding: '15px',
      borderRadius: '10px',
      backgroundColor: dark ? '#201436' : '#f0f2f5',
      color: dark ? '#e0d6f7' : '#201436',
      fontFamily: 'monospace',
      minHeight: '100px',
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: dark ? '#1a1a2e' : '#f0f2f5',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: dark ? '#3730a3' : '#d6e4ff',
        borderRadius: '4px',
      },
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
        <label style={{ color: dark ? '#e0d6f7' : '#201436' }}>
          <input type="checkbox" checked={confirmOn} onChange={e => setConfirmOn(e.target.checked)} />
          <span className="ml-1">Confirm</span>
        </label>
        <button onClick={handleLogout} style={styles.button(dark, false)}>Logout</button>
      </div>
      {/* Main Card */}
      <div style={styles.container(dark)}>
        <h1 style={styles.h1(dark)}>Manual Workflow Controls</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <button style={styles.button(dark, false)} onClick={() => goTo('/submit', 'Student Submission')}>Simulate Student Submission</button>
          <button style={styles.button(dark, false)} onClick={() => goTo('/review', 'Librarian Review')}>Simulate Librarian Review</button>
          <button style={styles.button(dark, false)} onClick={() => goTo('/final-approval', 'Final Approval')}>Simulate Final Approval</button>
        </div>
        <div style={styles.log(dark)}>
          {log.length === 0 ? 'No workflow actions yet.' : log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
}