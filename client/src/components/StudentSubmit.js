import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * StudentSubmit component for students to submit dissertations.
 * Includes settings (dark mode, font size, confirm), access control, and submission logic.
 */
export default function StudentSubmit() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState('');
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px');
  const [confirmOn, setConfirmOn] = useState(localStorage.getItem('confirmOn') !== 'false');
  const navigate = useNavigate();

  // Access control: only students allowed
  useEffect(() => {
    const user = atob(sessionStorage.getItem('authUser') || '');
    const role = atob(sessionStorage.getItem('authRole') || '');
    const exp = +sessionStorage.getItem('expiresAt') || 0;
    if (role !== 'student' || Date.now() > exp) {
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
      <div className="container mx-auto max-w-md p-6 bg-white rounded shadow mt-8">
        <h1 className="text-2xl font-bold mb-4">Submit Dissertation</h1>
        <input
          type="text"
          placeholder="First Name"
          value={first}
          onChange={e => setFirst(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={last}
          onChange={e => setLast(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="file"
          accept=".pdf"
          onChange={e => setFile(e.target.files[0])}
          className="w-full p-2 mb-2 border rounded"
        />
        <textarea
          rows={4}
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-purple-800 text-white rounded hover:bg-purple-900"
        >
          📤 Submit
        </button>
        {alert && <div className="mt-4 text-green-600 text-center">{alert}</div>}
      </div>
    </div>
  );
}