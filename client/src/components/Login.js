import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const roleToRoute = {
  student: '/submit',
  librarian: '/review',
  reviewer: '/final-approval',
  admin: '/dashboard'
};

const styles = {
  // Light/dark background gradient
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
    border: '1.5px solid ' + (dark ? '#bbaed6' : '#bbaed6'),
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
    border: '1.5px solid ' + (dark ? '#bbaed6' : '#bbaed6'),
    boxSizing: 'border-box',
  }),
  // Card floats above background, light or dark
  container: (dark) => ({
    background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255,255,255,0.98)',
    padding: '2.5rem 2rem 2rem 2rem',
    borderRadius: '18px',
    boxShadow: dark
      ? '0 8px 40px 0 rgba(79,38,131,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.18)'
      : '0 4px 32px rgba(80,40,130,0.10)',
    width: '100%',
    maxWidth: 370,
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
  }),
  h2: dark => ({
    fontFamily: "'BentonSans Bold'",
    marginBottom: '0.5rem',
    color: dark ? '#e0d6f7' : '#201436',
    textAlign: 'center',
    fontSize: '2rem',
    letterSpacing: '-1px',
    transition: 'color .3s',
  }),
  subtitle: dark => ({
    color: dark ? '#bbaed6' : '#6b6b6b',
    fontSize: '1.05rem',
    marginBottom: '2rem',
    textAlign: 'center',
  }),
  label: dark => ({
    display: 'block',
    marginBottom: 6,
    color: dark ? '#e0d6f7' : '#201436',
    fontWeight: 500,
    fontSize: '1rem',
    letterSpacing: '-0.5px',
  }),
  inputWrap: {
    width: '100%',
    marginBottom: '1.2rem',
    position: 'relative',
  },
  input: (dark, hasError) => ({
    width: '100%',
    padding: '0.85rem 1rem',
    border: hasError ? (dark ? '2px solid #a259e6' : '2px solid #a259e6') : (dark ? '1.5px solid #4F2683' : '1.5px solid #bbaed6'),
    borderRadius: '6px',
    fontSize: '1.08rem',
    background: dark ? '#2a1a3a' : '#f9f9f9',
    color: dark ? '#e0d6f7' : '#201436',
    outline: 'none',
    transition: 'border .2s, background .3s, color .3s',
    boxSizing: 'border-box',
    fontFamily: "'BentonSans Book'",
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
  showHideBtn: dark => ({
    position: 'absolute',
    right: 12,
    top: 0,
    height: '100%',
    width: 32,
    background: 'none',
    border: 'none',
    color: dark ? '#bbaed6' : '#4F2683',
    fontSize: 18,
    cursor: 'pointer',
    padding: 0,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'color .3s',
  }),
  button: (dark, loading) => ({
    width: '100%',
    padding: '0.85rem',
    background: loading ? (dark ? '#3d1c6a' : '#bbaed6') : (dark ? '#4F2683' : '#a259e6'),
    color: dark ? '#e0d6f7' : '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1.1rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: "'BentonSans Book'",
    fontWeight: 600,
    marginTop: 8,
    boxShadow: dark
      ? '0 2px 8px rgba(79,38,131,0.25)'
      : '0 2px 8px rgba(80,40,130,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'background .3s',
  }),
  spinner: {
    width: 18,
    height: 18,
    border: '2.5px solid #bbaed6',
    borderTop: '2.5px solid #4F2683',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    color: '#e74c3c',
    fontSize: '1rem',
    marginBottom: '1.2rem',
    textAlign: 'center',
    minHeight: 24,
    fontWeight: 500,
    letterSpacing: '-0.5px',
    transition: 'color .3s',
  },
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'none' },
  },
  '@keyframes spin': {
    to: { transform: 'rotate(360deg)' },
  },
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize;
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await api.post('/login', { username, password });
      const { username: u, role } = resp.data;
      sessionStorage.setItem('authUser', btoa(u));
      sessionStorage.setItem('authRole', btoa(role));
      sessionStorage.setItem('expiresAt', (Date.now() + 15 * 60 * 1000).toString());
      navigate(roleToRoute[role] || '/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
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
          <input
            type="checkbox"
            checked={dark}
            onChange={e => setDark(e.target.checked)}
            id="darkToggle"
            style={{ display: 'none' }}
            tabIndex={-1}
            aria-label="Toggle dark mode"
          />
          <span style={styles.slider(dark)}>
            <span style={styles.sliderBefore(dark)}>{dark ? '🌙' : '☀'}</span>
          </span>
        </label>
        <select
          id="fontSizeSelect"
          value={fontSize}
          onChange={e => setFontSize(e.target.value)}
          aria-label="Font size"
          style={styles.select(dark)}
        >
          <option value="14px">Default</option>
          <option value="16px">Large</option>
          <option value="12px">Small</option>
        </select>
      </div>
      <form style={styles.container(dark)} onSubmit={handleSubmit} autoComplete="on" aria-label="Login form">
        <h2 style={styles.h2(dark)}>Sign In</h2>
        <div style={styles.subtitle(dark)}>Welcome to DSpace Workflow. Please log in to continue.</div>
        <div style={styles.error}>{error}</div>
        <div style={styles.inputWrap}>
          <label htmlFor="username" style={styles.label(dark)}>
            Username
          </label>
          <input
            style={styles.input(dark, !!error)}
            type="text"
            id="username"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error' : undefined}
            tabIndex={1}
          />
        </div>
        <div style={styles.inputWrap}>
          <label htmlFor="password" style={styles.label(dark)}>
            Password
          </label>
          <input
            style={styles.input(dark, !!error)}
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error' : undefined}
            tabIndex={2}
          />
        </div>
        <button
          type="submit"
          style={styles.button(dark, loading)}
          disabled={loading}
          tabIndex={4}
        >
          {loading && <span style={styles.spinner} aria-label="Loading" />} Log In
        </button>
      </form>
      {/* Keyframes for fadeIn and spinner */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}