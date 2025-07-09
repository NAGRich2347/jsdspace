import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const roleToRoute = {
  student: '/submit',
  librarian: '/review',
  reviewer: '/final-approval',
  admin: '/dashboard'
};

const styles = {
  body: {
    fontFamily: "'BentonSans Book', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    margin: 0,
    backgroundColor: '#f1f1f1',
  },
  container: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '320px',
  },
  h2: {
    fontFamily: "'BentonSans Bold'",
    marginBottom: '1rem',
    color: '#201436',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#4F2683',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: "'BentonSans Book'",
  },
  buttonHover: {
    backgroundColor: '#3d1c6a',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const resp = await api.post('/login', { username, password });
      const { username: u, role } = resp.data;
      sessionStorage.setItem('authUser', btoa(u));
      sessionStorage.setItem('authRole', btoa(role));
      sessionStorage.setItem('expiresAt', (Date.now() + 15 * 60 * 1000).toString());
      navigate(roleToRoute[role] || '/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h2 style={styles.h2}>Sign In</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            style={hover ? { ...styles.button, ...styles.buttonHover } : styles.button}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}