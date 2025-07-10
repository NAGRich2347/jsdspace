import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  body: (dark, fontSize) => ({
    fontFamily: "'BentonSans Book', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    minHeight: 0,
    minWidth: 0,
    margin: 0,
    padding: 0,
    background: dark
      ? 'radial-gradient(ellipse at 50% 40%, #231942 0%, #4F2683 80%, #18122b 100%)'
      : 'radial-gradient(ellipse at 50% 40%, #fff 0%, #e9e6f7 80%, #cfc6e6 100%)',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'background .3s,color .3s',
    fontSize,
    boxSizing: 'border-box',
    overflow: 'hidden',
    outline: 'none',
  }),
  settingsBar: {
    position: 'fixed',
    top: 15,
    right: 20,
    display: 'flex',
    gap: '1rem',
    zIndex: 1000,
    alignItems: 'center',
  },
  slider: dark => ({
    position: 'relative',
    width: 50,
    height: 24,
    borderRadius: 24,
    background: dark ? '#4F2683' : '#e9e6f7',
    border: '1.5px solid #bbaed6',
    transition: '.4s',
    display: 'inline-block',
    marginLeft: 4,
    marginRight: 4,
    boxSizing: 'border-box',
  }),
  sliderBefore: dark => ({
    content: dark ? '"🌙"' : '"☀"',
    position: 'absolute',
    width: 18,
    height: 18,
    left: dark ? 29 : 3,
    bottom: 3,
    background: dark ? '#231942' : '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '.4s',
    color: dark ? '#e0d6f7' : '#4F2683',
    fontSize: 14,
    textAlign: 'center',
    border: '1.5px solid #bbaed6',
    boxSizing: 'border-box',
  }),
  container: dark => ({
    background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255,255,255,0.98)',
    padding: '2.5rem 2rem 2rem 2rem',
    borderRadius: '18px',
    boxShadow: dark
      ? '0 8px 40px 0 rgba(79,38,131,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.18)'
      : '0 4px 32px rgba(80,40,130,0.10)',
    width: '100%',
    maxWidth: 500,
    minWidth: 0,
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeIn .7s',
    transition: 'background .3s,color .3s',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    overflow: 'visible',
    textAlign: 'center',
  }),
  h1: dark => ({
    fontFamily: "'BentonSans Bold'",
    color: dark ? '#e0d6f7' : '#201436',
    fontSize: '2rem',
    marginBottom: '1.5rem',
    letterSpacing: '-1px',
    transition: 'color .3s',
  }),
  input: (dark, hasError) => ({
    width: '100%',
    padding: '.85rem 1rem',
    margin: '.5rem 0',
    border: hasError ? (dark ? '2px solid #a259e6' : '2px solid #a259e6') : (dark ? '1.5px solid #4F2683' : '1.5px solid #bbaed6'),
    borderRadius: 6,
    fontFamily: "'BentonSans Book'",
    fontSize: '1.08rem',
    background: dark ? '#2a1a3a' : '#f9f9f9',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'border .2s, background .3s, color .3s',
    boxSizing: 'border-box',
    outline: 'none',
  }),
  fileInput: dark => ({
    width: '100%',
    padding: '.85rem 1rem',
    margin: '.5rem 0',
    border: dark ? '1.5px solid #4F2683' : '1.5px solid #bbaed6',
    borderRadius: 6,
    fontFamily: "'BentonSans Book'",
    fontSize: '1.08rem',
    background: dark ? '#2a1a3a' : '#f9f9f9',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'border .2s, background .3s, color .3s',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'pointer',
  }),
  textarea: dark => ({
    width: '100%',
    padding: '.85rem 1rem',
    margin: '.5rem 0',
    border: dark ? '1.5px solid #4F2683' : '1.5px solid #bbaed6',
    borderRadius: 6,
    fontFamily: "'BentonSans Book'",
    fontSize: '1.08rem',
    background: dark ? '#2a1a3a' : '#f9f9f9',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'border .2s, background .3s, color .3s',
    boxSizing: 'border-box',
    outline: 'none',
  }),
  select: dark => ({
    padding: '0.4rem 1.2rem 0.4rem 0.6rem',
    borderRadius: 6,
    border: '1.5px solid #bbaed6',
    background: dark ? '#2a1a3a' : '#fff',
    color: dark ? '#e0d6f7' : '#201436',
    fontFamily: "'BentonSans Book'",
    fontSize: '1rem',
    outline: 'none',
    transition: 'background .3s,color .3s',
    boxSizing: 'border-box',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    cursor: 'pointer',
    boxShadow: 'none',
  }),
  button: (dark, hover) => ({
    padding: '.85rem 1.5rem',
    background: hover ? (dark ? '#3d1c6a' : '#bbaed6') : (dark ? '#4F2683' : '#a259e6'),
    color: dark ? '#e0d6f7' : '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: "'BentonSans Book'",
    fontWeight: 600,
    fontSize: '1.1rem',
    marginTop: 8,
    boxShadow: dark
      ? '0 2px 8px rgba(79,38,131,0.25)'
      : '0 2px 8px rgba(80,40,130,0.08)',
    transition: 'background .3s',
    outline: 'none',
  }),
  alert: dark => ({
    marginTop: '1rem',
    color: dark ? '#b6f7b6' : 'green',
    display: 'block',
    fontWeight: 500,
    fontSize: '1rem',
    letterSpacing: '-0.5px',
    minHeight: 24,
    textAlign: 'center',
    transition: 'color .3s',
  }),
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'none' },
  },
};

export default function StudentSubmit() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState('');
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px');
  const [confirmOn, setConfirmOn] = useState(localStorage.getItem('confirmOn') !== 'false');
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  // Access control: only students allowed
  useEffect(() => {
    const role = atob(sessionStorage.getItem('authRole') || '');
    const exp = +sessionStorage.getItem('expiresAt') || 0;
    if (role !== 'student' || Date.now() > exp) {
      alert('Unauthorized');
      navigate('/login');
    }
  }, [navigate]);

  // Settings persistence
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('confirmOn', confirmOn);
  }, [dark, fontSize, confirmOn]);

  // Submission logic (localStorage for demo)
  const handleSubmit = () => {
    if (!first.trim() || !last.trim() || !file) {
      alert('Fill all');
      return;
    }
    if (confirmOn && !window.confirm('Submit now?')) return;
    const user = atob(sessionStorage.getItem('authUser') || '');
    const key = `submissions_${user}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now(), limit = 4 * 60 * 60 * 1000;
    const recent = arr.filter(x => now - x.time < limit);
    if (recent.length >= 2) {
      alert('Limit 2 per 4h');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      arr.push({
        filename: `${first}_${last}_Stage1.pdf`,
        content: e.target.result.split(',')[1],
        notes,
        time: now,
        stage: 'Stage1',
        user
      });
      localStorage.setItem(key, JSON.stringify(arr));
      // broadcast to global submissions
      const all = JSON.parse(localStorage.getItem('submissions') || '[]');
      all.push(arr[arr.length - 1]);
      localStorage.setItem('submissions', JSON.stringify(all));
      setAlert('Submitted successfully!');
      setTimeout(() => setAlert(''), 10000);
      setFirst('');
      setLast('');
      setFile(null);
      setNotes('');
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ ...styles.body(dark, fontSize) }}>
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
        input[type='file']::file-selector-button {
          padding: 0.4rem 1.2rem;
          border-radius: 6px;
          border: 1.5px solid #bbaed6;
          background: ${dark ? '#2a1a3a' : '#fff'};
          color: ${dark ? '#e0d6f7' : '#201436'};
          font-family: 'BentonSans Book', sans-serif;
          font-size: 1rem;
          cursor: pointer;
          transition: background .3s, color .3s, border-color .3s;
        }
        input[type='file']::-webkit-file-upload-button {
          padding: 0.4rem 1.2rem;
          border-radius: 6px;
          border: 1.5px solid #bbaed6;
          background: ${dark ? '#2a1a3a' : '#fff'};
          color: ${dark ? '#e0d6f7' : '#201436'};
          font-family: 'BentonSans Book', sans-serif;
          font-size: 1rem;
          cursor: pointer;
          transition: background .3s, color .3s, border-color .3s;
        }
      `}</style>
      {/* Settings Bar */}
      <div style={styles.settingsBar}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={dark}
            onChange={e => setDark(e.target.checked)}
            id="darkToggle"
            style={{ display: 'none' }}
          />
          <span style={styles.slider(dark)}>
            <span style={styles.sliderBefore(dark)}>{dark ? '🌙' : '☀'}</span>
          </span>
        </label>
        <select
          id="fontSizeSelect"
          value={fontSize}
          onChange={e => setFontSize(e.target.value)}
          style={styles.select(dark)}
        >
          <option value="14px">Default</option>
          <option value="16px">Large</option>
          <option value="12px">Small</option>
        </select>
        <label style={{ fontFamily: "'BentonSans Book'" }}>
          <input
            type="checkbox"
            checked={confirmOn}
            onChange={e => setConfirmOn(e.target.checked)}
            id="confirmToggle"
          />
          Confirm
        </label>
        <button onClick={handleLogout} style={styles.button(dark, hover)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>Logout</button>
      </div>
      {/* Main Form */}
      <div style={styles.container(dark)}>
        <h1 style={styles.h1(dark)}>Submit Dissertation</h1>
        <input
          type="text"
          placeholder="First Name"
          value={first}
          onChange={e => setFirst(e.target.value)}
          style={styles.input(dark, false)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={last}
          onChange={e => setLast(e.target.value)}
          style={styles.input(dark, false)}
        />
        <input
          type="file"
          accept=".pdf"
          onChange={e => setFile(e.target.files[0])}
          style={styles.fileInput(dark)}
        />
        <textarea
          rows={4}
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={styles.textarea(dark)}
        />
        <button
          onClick={handleSubmit}
          style={styles.button(dark, hover)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          📤 Submit
        </button>
        {alert && <div style={styles.alert(dark)}>{alert}</div>}
      </div>
    </div>
  );
}