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
        <label>
          <input type="checkbox" checked={confirmOn} onChange={e => setConfirmOn(e.target.checked)} />
          <span className="ml-1">Confirm</span>
        </label>
        <button onClick={handleLogout} className="px-3 py-1 bg-purple-800 text-white rounded">Logout</button>
      </div>
      <div className="container mx-auto max-w-lg p-6 bg-white rounded shadow mt-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Manual Workflow Controls</h1>
        <div className="flex flex-col gap-4 items-center">
          <button className="btn px-6 py-2 bg-purple-800 text-white rounded hover:bg-purple-900" onClick={() => goTo('/submit', 'Student Submission')}>Simulate Student Submission</button>
          <button className="btn px-6 py-2 bg-purple-800 text-white rounded hover:bg-purple-900" onClick={() => goTo('/review', 'Librarian Review')}>Simulate Librarian Review</button>
          <button className="btn px-6 py-2 bg-purple-800 text-white rounded hover:bg-purple-900" onClick={() => goTo('/final-approval', 'Final Approval')}>Simulate Final Approval</button>
        </div>
        <div className={`log mt-6 p-4 rounded ${dark ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'}`} style={{ fontFamily: 'monospace', minHeight: '80px' }}>
          {log.length === 0 ? 'No workflow actions yet.' : log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
}