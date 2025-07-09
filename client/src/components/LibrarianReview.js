import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  body: dark => ({
    fontFamily: "'BentonSans Book', sans-serif",
    display: 'flex',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
    background: dark ? '#1e1e1e' : '#f1f1f1',
    color: dark ? '#fff' : '#201436',
    transition: 'background .3s,color .3s',
    boxSizing: 'border-box',
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
  sidebar: (dark, open) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 260,
    background: dark ? '#2e2e2e' : '#fff',
    padding: '1rem',
    overflowY: 'auto',
    overflowX: 'hidden',
    transform: open ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform .4s',
    zIndex: 900,
    borderRight: '1px solid #ccc',
    height: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
  }),
  sidebarInput: dark => ({
    width: '100%',
    padding: '.5rem',
    marginTop: 60,
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontFamily: "'BentonSans Book'",
    background: dark ? '#3b3b3b' : undefined,
    color: dark ? '#fff' : undefined,
    borderColor: dark ? '#666' : '#ccc',
  }),
  submissionItem: dark => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '.5rem',
    marginBottom: '.5rem',
    background: dark ? '#2e2e2e' : '#fff',
    border: '1px solid #ccc',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '1rem',
    color: dark ? '#fff' : '#201436',
    transition: 'background .3s',
  }),
  submissionItemHover: dark => ({
    background: dark ? '#444' : '#eaeaea',
  }),
  main: open => ({
    flex: 1,
    marginLeft: open ? 260 : 0,
    padding: '2rem',
    transition: 'margin-left .4s',
    overflowX: 'hidden',
    height: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  }),
  hamburger: (dark, open) => ({
    position: 'fixed',
    top: 15,
    left: 15,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 30,
    height: 25,
    cursor: 'pointer',
    zIndex: 1000,
  }),
  hamburgerBar: (dark, open, idx) => {
    let style = {
      width: '100%',
      height: 3,
      background: dark ? '#fff' : '#201436',
      transition: 'transform .3s,opacity .3s',
    };
    if (open && idx === 0) style = { ...style, transform: 'translateY(11px) rotate(45deg)' };
    if (open && idx === 1) style = { ...style, opacity: 0 };
    if (open && idx === 2) style = { ...style, transform: 'translateY(-11px) rotate(-45deg)' };
    return style;
  },
  h1: {
    fontFamily: "'BentonSans Bold'",
    marginTop: '1.5rem',
    textAlign: 'center',
  },
  pdfViewer: {
    width: '100%',
    flex: 1,
    minHeight: 0,
    border: '1px solid #ccc',
    margin: '1.5rem 0',
    boxSizing: 'border-box',
  },
  textarea: dark => ({
    width: '90%',
    padding: '.5rem',
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontFamily: "'BentonSans Book'",
    background: dark ? '#3b3b3b' : undefined,
    color: dark ? '#fff' : undefined,
    borderColor: dark ? '#666' : '#ccc',
    transition: 'background .3s,color .3s',
  }),
  inputFile: dark => ({
    width: '90%',
    padding: '.5rem',
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontFamily: "'BentonSans Book'",
    background: dark ? '#3b3b3b' : undefined,
    color: dark ? '#fff' : undefined,
    borderColor: dark ? '#666' : '#ccc',
    transition: 'background .3s,color .3s',
  }),
  uploadBtn: {
    background: '#4F2683',
    color: '#fff',
    padding: '.75rem 1.5rem',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'background .3s',
    fontFamily: "'BentonSans Book'",
  },
  uploadBtnHover: {
    background: '#3d1c6a',
  },
};

export default function LibrarianReview() {
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px');
  const [confirmOn, setConfirmOn] = useState(localStorage.getItem('confirmOn') !== 'false');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [receipts, setReceipts] = useState({});
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [btnHover, setBtnHover] = useState(false);
  const pdfViewerRef = useRef();
  const navigate = useNavigate();

  // Access control: only librarians allowed
  useEffect(() => {
    const role = atob(sessionStorage.getItem('authRole') || '');
    const exp = +sessionStorage.getItem('expiresAt') || 0;
    if (role !== 'librarian' || Date.now() > exp) {
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

  // Load submissions and receipts
  useEffect(() => {
    setSubmissions(JSON.parse(localStorage.getItem('submissions') || '[]'));
    setReceipts(JSON.parse(localStorage.getItem('receipts') || '{}'));
  }, []);

  // Filtered submissions for Stage1
  const filtered = submissions.filter(s => s.stage === 'Stage1' && (!search || s.filename.toLowerCase().includes(search.toLowerCase())));

  // Select a submission
  const selectSubmission = (s, idx) => {
    if (confirmOn && !window.confirm('Open submission?')) return;
    const newReceipts = { ...receipts, [s.filename]: true };
    setReceipts(newReceipts);
    localStorage.setItem('receipts', JSON.stringify(newReceipts));
    setSelected(s);
    // Show PDF in iframe
    if (pdfViewerRef.current) {
      const blob = new Blob([Uint8Array.from(atob(s.content), c => c.charCodeAt(0))], { type: 'application/pdf' });
      pdfViewerRef.current.src = URL.createObjectURL(blob);
    }
  };

  // Send to reviewer
  const sendToReviewer = () => {
    if (!selected) return alert('Select one');
    if (confirmOn && !window.confirm('Send to reviewer?')) return;
    const updatedSubs = submissions.filter(x => x !== selected);
    const newSel = { ...selected, stage: 'Stage2', time: Date.now() };
    updatedSubs.push(newSel);
    localStorage.setItem('submissions', JSON.stringify(updatedSubs));
    setSubmissions(updatedSubs);
    setSelected(null);
    setNotes('');
    alert('Sent to Reviewer');
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
        <button onClick={handleLogout} style={styles.uploadBtn}>Logout</button>
      </div>
      {/* Sidebar */}
      <div style={styles.sidebar(dark, sidebarOpen)}>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.sidebarInput(dark)}
        />
        <div>
          {filtered.map((s, i) => (
            <div
              key={i}
              style={{
                ...styles.submissionItem(dark),
                ...(hoverIdx === i ? styles.submissionItemHover(dark) : {}),
              }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(-1)}
              onClick={() => selectSubmission(s, i)}
            >
              <span>{s.filename}</span>
              <span>{receipts[s.filename] ? '✅' : '⚠️'}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Hamburger */}
      <div style={styles.hamburger(dark, sidebarOpen)} onClick={() => setSidebarOpen(!sidebarOpen)}>
        {[0, 1, 2].map(idx => (
          <div key={idx} style={styles.hamburgerBar(dark, sidebarOpen, idx)}></div>
        ))}
      </div>
      {/* Main content */}
      <div style={styles.main(sidebarOpen)}>
        <h1 style={styles.h1}>Librarian Review</h1>
        <div style={{ fontWeight: 500 }}>{selected ? selected.filename : ''}</div>
        <iframe ref={pdfViewerRef} title="PDF Viewer" style={styles.pdfViewer} />
        <textarea
          rows={4}
          placeholder="Your notes…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={styles.textarea(dark)}
        />
        <input
          type="file"
          accept=".txt,.pdf"
          style={styles.inputFile(dark)}
        />
        <button
          style={btnHover ? { ...styles.uploadBtn, ...styles.uploadBtnHover } : styles.uploadBtn}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          onClick={sendToReviewer}
        >
          📤 Send to Reviewer
        </button>
      </div>
    </div>
  );
}