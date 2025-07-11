import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
// Remove: import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js';
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

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
  container: dark => ({
    background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255,255,255,0.98)',
    padding: '2.5rem 2rem 2rem 2rem',
    borderRadius: '18px',
    boxShadow: dark
      ? '0 8px 40px 0 rgba(79,38,131,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.18)'
      : '0 4px 32px rgba(80,40,130,0.10)',
    width: '100%',
    maxWidth: 700,
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
    maxHeight: '80vh',
    overflowY: 'auto',
  }),
  h1: dark => ({
    fontFamily: "'BentonSans Bold'",
    color: dark ? '#e0d6f7' : '#201436',
    fontSize: '2rem',
    marginBottom: '1.5rem',
    letterSpacing: '-1px',
    transition: 'color .3s',
  }),
  sidebar: (dark, open) => ({
    position: 'fixed',
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
    borderRight: '1.5px solid #bbaed6',
    height: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
  }),
  sidebarInput: dark => ({
    width: '100%',
    padding: '.85rem 1rem',
    marginTop: 100, // was 60, now 100 for better alignment
    marginBottom: '1rem',
    border: '1.5px solid #bbaed6',
    borderRadius: 6,
    fontFamily: "'BentonSans Book'",
    background: dark ? '#2a1a3a' : '#f9f9f9',
    color: dark ? '#e0d6f7' : '#201436',
    fontSize: '1.08rem',
    outline: 'none',
    transition: 'border .2s, background .3s, color .3s',
    boxSizing: 'border-box',
  }),
  submissionItem: (dark, active) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '.5rem',
    marginBottom: '.5rem',
    background: active ? (dark ? '#4F2683' : '#bbaed6') : (dark ? '#2e2e2e' : '#fff'),
    border: '1.5px solid #bbaed6',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '1rem',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'background .3s',
    fontWeight: active ? 600 : 400,
  }),
  main: open => ({
    flex: 1,
    marginLeft: open ? 260 : 0,
    padding: '2.5rem 2rem 2rem 2rem',
    transition: 'margin-left .4s',
    minHeight: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  }),
  pdfViewer: {
    width: '100%',
    maxWidth: '1350px',
    height: 'auto',
    maxHeight: '50vh',
    minHeight: '300px',
    border: '1.5px solid #bbaed6',
    margin: '1.5rem auto',
    boxSizing: 'border-box',
    borderRadius: 6,
    background: '#fff',
    display: 'block',
  },
  textarea: dark => ({
    width: '90%',
    padding: '.85rem 1rem',
    marginBottom: '1rem',
    border: '1.5px solid #bbaed6',
    borderRadius: 6,
    fontFamily: "'BentonSans Book'",
    fontSize: '1.08rem',
    background: dark ? '#2a1a3a' : '#f9f9f9',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'border .2s, background .3s, color .3s',
    boxSizing: 'border-box',
    outline: 'none',
  }),
  inputFile: dark => ({
    width: '90%',
    padding: '.85rem 1rem',
    marginBottom: '1rem',
    border: '1.5px solid #bbaed6',
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
  button: (dark, hover) => ({
    background: hover ? (dark ? '#3d1c6a' : '#bbaed6') : (dark ? '#4F2683' : '#a259e6'),
    color: dark ? '#e0d6f7' : '#fff',
    padding: '.85rem 1.5rem',
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
  checkbox: dark => ({
    width: 16,
    height: 16,
    accentColor: dark ? '#4F2683' : '#a259e6',
    cursor: 'pointer',
  }),
  label: dark => ({
    display: 'block',
    marginBottom: 6,
    color: dark ? '#e0d6f7' : '#201436',
    fontWeight: 500,
    fontSize: '1rem',
    letterSpacing: '-0.5px',
  }),
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'none' },
  },
  hamburger: (dark, open) => ({
    position: 'fixed',
    top: 18, // Match settings bar top
    left: 28, // Match settings bar right spacing, but on left
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
      background: dark ? '#e0d6f7' : '#201436',
      transition: 'transform .3s,opacity .3s',
    };
    if (open && idx === 0) style = { ...style, transform: 'translateY(11px) rotate(45deg)' };
    if (open && idx === 1) style = { ...style, opacity: 0 };
    if (open && idx === 2) style = { ...style, transform: 'translateY(-11px) rotate(-45deg)' };
    return style;
  },
};

// Helper to get display filename
const getDisplayFilename = (s) => {
  if (!s) return '';
  if (s.filename && s.filename.match(/^.+_.+_Stage1\.pdf$/i)) return s.filename;
  // Try to parse from user/first/last if available
  let first = s.first || (s.user ? s.user.split('_')[0] : '');
  let last = s.last || (s.user ? s.user.split('_')[1] : '');
  return `${first}_${last}_Stage1.pdf`;
};

export default function FinalApproval() {
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
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [successMsg, setSuccessMsg] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfViewerSize, setPdfViewerSize] = useState({ width: 2000, height: window.innerHeight - 100 });
  // Add state for settings panel
  const [settingsOpen, setSettingsOpen] = useState(false);

  const REVIEW_CONTROLS_WIDTH = 350;
  const HORIZONTAL_GAP = 20; // matches the gap and review controls padding
  const CONTAINER_HORIZONTAL_PADDING = 32; // 2rem in px
  const CONTAINER_VERTICAL_PADDING = 40; // 2.5rem in px

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
    document.documentElement.style.fontSize = fontSize;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('confirmOn', confirmOn);
  }, [dark, fontSize, confirmOn]);

  // Load submissions and receipts
  useEffect(() => {
    setSubmissions(JSON.parse(localStorage.getItem('submissions') || '[]'));
    setReceipts(JSON.parse(localStorage.getItem('receipts') || '{}'));
    // Restore selected document, notes, and scroll position
    const savedSelected = localStorage.getItem('reviewerSelected');
    const savedNotes = localStorage.getItem('reviewerNotes');
    const savedScroll = localStorage.getItem('reviewerScroll');
    if (savedSelected) {
      const found = JSON.parse(localStorage.getItem('submissions') || '[]').find(s => getDisplayFilename(s) === savedSelected);
      if (found) setSelected(found);
    }
    if (savedNotes) setNotes(savedNotes);
    if (savedScroll) window.scrollTo(0, parseInt(savedScroll, 10));
  }, []);

  // Persist notes, selected, and scroll position
  useEffect(() => {
    if (selected) localStorage.setItem('reviewerSelected', getDisplayFilename(selected));
    if (notes !== undefined) localStorage.setItem('reviewerNotes', notes);
    const onScroll = () => localStorage.setItem('reviewerScroll', window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [selected, notes]);

  // Filtered submissions for Stage2
  const filtered = submissions.filter(s => s.stage === 'Stage2' && (!search || s.filename.toLowerCase().includes(search.toLowerCase())));

  // Select a submission
  const selectSubmission = (s, idx) => {
    if (confirmOn && !window.confirm('Open submission?')) return;
    const newReceipts = { ...receipts, [s.filename]: true };
    setReceipts(newReceipts);
    localStorage.setItem('receipts', JSON.stringify(newReceipts));
    setSelected(s);
    // Set blob URL for popout
    const blob = new Blob([Uint8Array.from(atob(s.content), c => c.charCodeAt(0))], { type: 'application/pdf' });
    let url = URL.createObjectURL(blob);
    url += '#zoom=page-fit'; // PDF.js fill viewer
    setPdfUrl(url);
    localStorage.setItem('reviewerSelected', getDisplayFilename(s));
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
    setFileInputKey(Date.now()); // Reset file input
    setSuccessMsg('Approved and published!');
    setTimeout(() => setSuccessMsg(''), 5000);
    alert('Approved and published!');
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  // Update getMaxPdfWidth to dynamically calculate max width
  const getMaxPdfWidth = () => {
    // window.innerWidth - sidebar (if open) - review controls - gaps - container paddings
    const sidebarWidth = sidebarOpen ? 260 : 0;
    const totalGaps = HORIZONTAL_GAP + CONTAINER_HORIZONTAL_PADDING;
    return (
      window.innerWidth - sidebarWidth - REVIEW_CONTROLS_WIDTH - totalGaps * 2
    );
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
      {/* Add back a visible settings bar at the top right */}
      <div style={{
        position: 'fixed',
        top: 18,
        right: 28,
        zIndex: 2001,
        background: dark ? 'rgba(36,18,54,0.98)' : '#f7fafc',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        marginBottom: '2.5rem', // Add vertical space below the bar
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} style={{ display: 'none' }} />
          <span style={styles.slider(dark)}>
            <span style={styles.sliderBefore(dark)}>{dark ? '🌙' : '☀'}</span>
          </span>
          <span style={{ color: dark ? '#e0d6f7' : '#201436', fontWeight: 500 }}>Dark Mode</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: dark ? '#e0d6f7' : '#201436', fontWeight: 500 }}>Font Size</span>
          <select value={fontSize} onChange={e => setFontSize(e.target.value)} style={styles.select(dark)}>
            <option value="14px">Default</option>
            <option value="16px">Large</option>
            <option value="12px">Small</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: dark ? '#e0d6f7' : '#201436', fontWeight: 500 }}>
          <input type="checkbox" checked={confirmOn} onChange={e => setConfirmOn(e.target.checked)} />
          Confirm
        </label>
        <button onClick={handleLogout} style={styles.button(dark, false)}>Logout</button>
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
                ...styles.submissionItem(dark, selected?.filename === s.filename),
                ...(hoverIdx === i ? { background: dark ? '#444' : '#eaeaea' } : {}),
              }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(-1)}
              onClick={() => selectSubmission(s, i)}
            >
              <span>{getDisplayFilename(s)}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Hamburger */}
      <div
        style={{
          ...styles.hamburger(dark, sidebarOpen),
          top: 33, // Vertically center hamburger with settings bar
          left: 28,
        }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {[0, 1, 2].map(idx => (
          <div key={idx} style={styles.hamburgerBar(dark, sidebarOpen, idx)}></div>
        ))}
      </div>
      {/* Main content */}
      <div style={styles.main(sidebarOpen)}>
        <div style={{
          ...styles.container(dark),
          maxWidth: 'none',
          width: '100%',
          height: '100%',
          padding: '2.5rem 2rem 2rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
          overflow: 'visible',
          maxHeight: 'none',
          overflowY: 'visible',
          marginTop: '5.5rem', // Add vertical space below the settings bar
        }}>
          <h1 style={styles.h1(dark)}>Final Reviewer</h1>
          <div style={{ fontWeight: 500, marginBottom: 12 }}>{selected ? getDisplayFilename(selected) : ''}</div>
          <div style={{
            display: 'flex',
            gap: HORIZONTAL_GAP,
            height: `calc(100vh - ${CONTAINER_VERTICAL_PADDING * 2 + 120}px)`, // 120px for header/other content
            width: '100%',
            position: 'relative',
            overflow: 'visible',
            alignItems: 'flex-start',
            boxSizing: 'border-box',
            paddingBottom: CONTAINER_VERTICAL_PADDING,
          }} id="pdf-review-flex-container">
            {/* PDF Viewer - Left Side */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              minHeight: '100%',
              boxSizing: 'border-box',
              paddingTop: 0,
              paddingBottom: 0,
            }}>
              <div style={{
                position: 'relative',
                left: 0,
                top: 0,
                width: pdfViewerSize.width,
                height: Math.min(pdfViewerSize.height, window.innerHeight - CONTAINER_VERTICAL_PADDING * 2 - 120), // Cap height to background box
                minWidth: 400,
                minHeight: 300,
                maxWidth: getMaxPdfWidth(),
                maxHeight: window.innerHeight - CONTAINER_VERTICAL_PADDING * 2 - 120, // Cap max height
                border: '2px solid #ccc',
                borderRadius: 8,
                overflow: 'hidden',
                zIndex: 5,
                background: '#fff',
                marginTop: 0,
                marginBottom: 0,
                boxSizing: 'border-box',
              }}>
                {/* Pop Out button absolutely positioned top-right */}
                {pdfUrl && (
                  <button
                    onClick={() => window.open(pdfUrl, '_blank')}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 20,
                      ...styles.button(dark),
                      margin: 0,
                      padding: '6px 16px',
                      fontSize: '1rem',
                      borderRadius: 6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  >
                    Pop Out
                  </button>
                )}
                {/* react-pdf viewer */}
                {selected && selected.content && (
                  <Document
                    file={new Blob([Uint8Array.from(atob(selected.content), c => c.charCodeAt(0))], { type: 'application/pdf' })}
                    loading="Loading PDF..."
                    error={<div style={{ color: 'red', padding: 20 }}>Failed to load PDF.</div>}
                    noData={<div style={{ color: 'gray', padding: 20 }}>No PDF selected.</div>}
                  >
                    <Page
                      pageNumber={1}
                      width={pdfViewerSize.width - 20}
                      height={Math.min(pdfViewerSize.height - 20, window.innerHeight - CONTAINER_VERTICAL_PADDING * 2 - 140)}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      scale={1}
                    />
                  </Document>
                )}
                {/* Resize handles */}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 8,
                    cursor: 'ew-resize',
                    background: 'rgba(0,0,0,0.1)',
                    zIndex: 10,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startWidth = pdfViewerSize.width;
                    
                    const handleMouseMove = (moveEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      const newWidth = Math.max(400, Math.min(startWidth + deltaX, getMaxPdfWidth()));
                      setPdfViewerSize(prev => ({ ...prev, width: newWidth }));
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 8,
                    cursor: 'ns-resize',
                    background: 'rgba(0,0,0,0.1)',
                    zIndex: 10,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startY = e.clientY;
                    const startHeight = pdfViewerSize.height;
                    
                    const handleMouseMove = (moveEvent) => {
                      const deltaY = moveEvent.clientY - startY;
                      const newHeight = Math.max(300, Math.min(startHeight + deltaY, window.innerHeight - CONTAINER_VERTICAL_PADDING * 2 - 120));
                      setPdfViewerSize(prev => ({ ...prev, height: newHeight }));
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: 8,
                    height: 8,
                    cursor: 'nwse-resize',
                    background: 'rgba(0,0,0,0.1)',
                    zIndex: 10,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = pdfViewerSize.width;
                    const startHeight = pdfViewerSize.height;
                    
                    const handleMouseMove = (moveEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      const deltaY = moveEvent.clientY - startY;
                      const newWidth = Math.max(400, Math.min(startWidth + deltaX, getMaxPdfWidth()));
                      const newHeight = Math.max(300, Math.min(startHeight + deltaY, window.innerHeight - CONTAINER_VERTICAL_PADDING * 2 - 120));
                      setPdfViewerSize(prev => ({ width: newWidth, height: newHeight }));
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </div>
            </div>
            {/* Review Controls - Right Side */}
            <div style={{
              width: REVIEW_CONTROLS_WIDTH,
              background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255,255,255,0.98)',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: dark
                ? '0 4px 20px rgba(79,38,131,0.3)'
                : '0 4px 20px rgba(0,0,0,0.1)',
              border: '1.5px solid #bbaed6',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              height: 'fit-content',
              maxHeight: '100%',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}>
              <h2 style={{
                fontFamily: "'BentonSans Bold'",
                color: dark ? '#e0d6f7' : '#201436',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}>Review Controls</h2>
              
              <div>
                <label style={styles.label(dark)}>Notes:</label>
                <textarea
                  rows={6}
                  placeholder="Your review notes…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={styles.textarea(dark)}
                />
              </div>
              
              <div>
                <label style={styles.label(dark)}>Upload Additional Files:</label>
                <input
                  key={fileInputKey}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  style={styles.inputFile(dark)}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  style={{
                    ...styles.button(dark, btnHover),
                    flex: 1,
                    background: '#28a745',
                  }}
                  onMouseEnter={() => setBtnHover(true)}
                  onMouseLeave={() => setBtnHover(false)}
                  onClick={approveSubmission}
                >
                  ✅ Approve & Publish
                </button>
              </div>
              
              {successMsg && (
                <div style={{
                  background: '#d4edda',
                  color: '#155724',
                  padding: '1rem',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontWeight: 500,
                }}>
                  {successMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}