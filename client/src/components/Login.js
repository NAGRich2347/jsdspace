import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Hardcoded users for demo; replace with API call in production
const users = [
  { username: 'student1', password: 'password', role: 'student' },
  { username: 'student2', password: 'password', role: 'student' },
  { username: 'student3', password: 'password', role: 'student' },
  { username: 'student4', password: 'password', role: 'student' },
  { username: 'librarian1', password: 'password', role: 'librarian' },
  { username: 'librarian2', password: 'password', role: 'librarian' },
  { username: 'reviewer1', password: 'password', role: 'reviewer' },
  { username: 'reviewer2', password: 'password', role: 'reviewer' },
  { username: 'admin1', password: 'password', role: 'admin' }
];

const roleToRoute = {
  student: '/submit',
  librarian: '/review',
  reviewer: '/final-approval',
  admin: '/dashboard'
};

/**
 * Login component for user authentication and role-based redirect.
 */
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Simulate user lookup (replace with API call in production)
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      setError('Invalid username or password.');
      return;
    }
    // Store session data (base64 for demo)
    sessionStorage.setItem('authUser', btoa(user.username));
    sessionStorage.setItem('authRole', btoa(user.role));
    sessionStorage.setItem('expiresAt', (Date.now() + 15 * 60 * 1000).toString());
    // Redirect to role page
    navigate(roleToRoute[user.role] || '/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center text-purple-900">Sign In</h2>
        {error && <div className="text-red-600 text-center mb-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full p-2 bg-purple-800 text-white rounded hover:bg-purple-900"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}