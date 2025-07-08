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
    <div className={`min-h-screen ${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
         style={{ fontSize }}>
      <div className="flex justify-end p-4 gap-4">
        <label>
          <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />
          <span className="ml-1">Dark</span>
        </label>
        <select value={fontSize} onChange={e => setFontSize(e.target.value)}>
          <option value="14px">Default</option>
          <option value="16px">Large</option>
          <option value="12px">Small</option>
        </select>
        <button onClick={handleLogout} className="px-3 py-1 bg-purple-800 text-white rounded">Logout</button>
      </div>
      <div className="container mx-auto max-w-3xl p-6 bg-white rounded shadow mt-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Administrator Dashboard</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 border">Time</th>
                <th className="px-4 py-2 border">User</th>
                <th className="px-4 py-2 border">Stage</th>
                <th className="px-4 py-2 border">Filename</th>
                <th className="px-4 py-2 border">Notes</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4">No submissions yet.</td></tr>
              ) : (
                submissions.map((s, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{new Date(s.time).toLocaleString()}</td>
                    <td className="border px-2 py-1">{s.user}</td>
                    <td className="border px-2 py-1">{s.stage}</td>
                    <td className="border px-2 py-1">{s.filename}</td>
                    <td className="border px-2 py-1">{s.notes || ''}</td>
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