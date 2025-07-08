import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FinalApproval() {
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px');
  const [confirmOn, setConfirmOn] = useState(localStorage.getItem('confirmOn') !== 'false');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const pdfViewerRef = useRef();
  const navigate = useNavigate();

  // Access control: only reviewers allowed
  useEffect(() => {
    const role = atob(sessionStorage.getItem('authRole') || '');
    const exp = +sessionStorage.getItem('expiresAt') || 0;
    if (role !== 'reviewer' || Date.now() > exp) {
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

  // Load submissions
  useEffect(() => {
    setSubmissions(JSON.parse(localStorage.getItem('submissions') || '[]'));
  }, []);

  // Filtered submissions for Stage2
  const filtered = submissions.filter(s => s.stage === 'Stage2' && (!search || s.filename.toLowerCase().includes(search.toLowerCase())));

  // Select a submission
  const selectSubmission = (s) => {
    if (confirmOn && !window.confirm('Open submission?')) return;
    setSelected(s);
    // Show PDF in iframe
    if (pdfViewerRef.current) {
      const blob = new Blob([Uint8Array.from(atob(s.content), c => c.charCodeAt(0))], { type: 'application/pdf' });
      pdfViewerRef.current.src = URL.createObjectURL(blob);
    }
  };

  // Approve submission
  const approveSubmission = () => {
    if (!selected) return alert('Select one');
    if (confirmOn && !window.confirm('Approve and publish?')) return;
    const updatedSubs = submissions.filter(x => x !== selected);
    // Mark as published (could add a published flag or remove from list)
    localStorage.setItem('submissions', JSON.stringify(updatedSubs));
    setSubmissions(updatedSubs);
    setSelected(null);
    setNotes('');
    alert('Approved and published!');
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
         style={{ fontSize }}>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r z-50 transition-transform duration-400 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${dark ? 'bg-gray-800 border-gray-700' : ''}`}
           style={{ boxShadow: sidebarOpen ? '2px 0 8px rgba(0,0,0,0.05)' : 'none' }}>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-2 mt-16 mb-2 border rounded"
        />
        <div>
          {filtered.map((s, i) => (
            <div
              key={i}
              className={`submission-item flex justify-between items-center p-2 mb-2 rounded cursor-pointer ${dark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
              style={{ border: '1px solid #4F2683' }}
              onClick={() => selectSubmission(s)}
            >
              <span>{s.filename}</span>
              <span className="flag ml-2">{selected && selected.filename === s.filename ? '⭐' : ''}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Hamburger */}
      <div className={`fixed top-4 left-4 z-60 cursor-pointer`} onClick={() => setSidebarOpen(!sidebarOpen)}>
        <div className={`w-8 h-1 bg-gray-800 mb-1 ${sidebarOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
        <div className={`w-8 h-1 bg-gray-800 mb-1 ${sidebarOpen ? 'opacity-0' : ''}`}></div>
        <div className={`w-8 h-1 bg-gray-800 ${sidebarOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
      </div>
      {/* Main content */}
      <div className="flex-1 ml-0 md:ml-64 p-8">
        <div className="flex justify-end gap-4 mb-4">
          <label>
            <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />
            <span className="ml-1">Dark</span>
          </label>
          <select value={fontSize} onChange={e => setFontSize(e.target.value)}>
            <option value="14px">Default</option>
            <option value="16px">Large</option>
            <option value="12px">Small</option>
          </select>
          <label><input type="checkbox" checked={confirmOn} onChange={e => setConfirmOn(e.target.checked)} /> <span className="ml-1">Confirm</span></label>
          <button onClick={handleLogout} className="px-3 py-1 bg-purple-800 text-white rounded">Logout</button>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-center">Final Approval</h1>
        <div className="font-semibold mb-2">{selected ? selected.filename : 'No submission selected'}</div>
        <iframe ref={pdfViewerRef} title="PDF Viewer" className="w-11/12 h-96 border mb-4" />
        <textarea
          rows={4}
          placeholder="Your notes…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-11/12 p-2 mb-2 border rounded"
        />
        <button
          className="upload-btn px-6 py-2 bg-green-700 text-white rounded hover:bg-green-900"
          onClick={approveSubmission}
        >
          ✅ Approve & Publish
        </button>
      </div>
    </div>
  );
}