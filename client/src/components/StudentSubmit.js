import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  body: dark => ({
    fontFamily: "'BentonSans Book', sans-serif",
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    margin: 0,
    background: dark ? '#1e1e1e' : '#f1f1f1',
    color: dark ? '#fff' : '#201436',
    transition: 'background .3s,color .3s',
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
    background: dark ? '#4F2683' : '#ccc',
    transition: '.4s',
    display: 'inline-block',
    marginLeft: 4,
    marginRight: 4,
  }),
  sliderBefore: dark => ({
    content: dark ? '"🌙"' : '"☀"',
    position: 'absolute',
    width: 18,
    height: 18,
    left: dark ? 29 : 3,
    bottom: 3,
    background: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '.4s',
    color: dark ? '#1e1e1e' : undefined,
    fontSize: 14,
    textAlign: 'center',
  }),
  container: {
    margin: 'auto',
    width: '90%',
    maxWidth: 500,
    textAlign: 'center',
  },
  h1: {
    fontFamily: "'BentonSans Bold'",
  },
  input: dark => ({
    width: '100%',
    padding: '.5rem',
    margin: '.5rem 0',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontFamily: "'BentonSans Book'",
    transition: 'background .3s,color .3s',
    background: dark ? '#3b3b3b' : undefined,
    color: dark ? '#fff' : undefined,
    borderColor: dark ? '#666' : '#ccc',
  }),
  textarea: dark => ({
    width: '100%',
    padding: '.5rem',
    margin: '.5rem 0',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontFamily: "'BentonSans Book'",
    transition: 'background .3s,color .3s',
    background: dark ? '#3b3b3b' : undefined,
    color: dark ? '#fff' : undefined,
    borderColor: dark ? '#666' : '#ccc',
  }),
  button: {
    padding: '.75rem 1.5rem',
    background: '#4F2683',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: "'BentonSans Book'",
    transition: 'background .3s',
    marginTop: 8,
  },
  buttonHover: {
    background: '#3d1c6a',
  },
  alert: {
    marginTop: '1rem',
    color: 'green',
    display: 'block',
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
    <div style={{ ...styles.body(dark), fontSize }}>
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
          style={{ fontFamily: "'BentonSans Book'" }}
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
        <button onClick={handleLogout} style={styles.button}>Logout</button>
      </div>
      {/* Main Form */}
      <div style={styles.container}>
        <h1 style={styles.h1}>Submit Dissertation</h1>
        <input
          type="text"
          placeholder="First Name"
          value={first}
          onChange={e => setFirst(e.target.value)}
          style={styles.input(dark)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={last}
          onChange={e => setLast(e.target.value)}
          style={styles.input(dark)}
        />
        <input
          type="file"
          accept=".pdf"
          onChange={e => setFile(e.target.files[0])}
          style={styles.input(dark)}
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
          style={hover ? { ...styles.button, ...styles.buttonHover } : styles.button}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          📤 Submit
        </button>
        {alert && <div style={styles.alert}>{alert}</div>}
      </div>
    </div>
  );
}