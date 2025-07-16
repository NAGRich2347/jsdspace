// --- FinalApproval.js ---
// React component for the final reviewer stage of the workflow system.
// Handles PDF review, download, preview, drag-and-drop, and submission details display.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationSystem from './NotificationSystem';
import WorkflowProgress from './WorkflowProgress';

// --- Styles object ---
// Contains all inline style definitions for the component UI
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
    padding: '2.5rem 2rem 2rem 2rem',
    transition: 'all .4s',
    minHeight: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
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

// --- Helper function ---
// Returns the display name for a submission
const getDisplayFilename = (s) => {
  if (!s) return '';
  if (s.filename && s.filename.match(/^.+_.+_Stage\d+\.pdf$/i)) return s.filename;
  // Try to parse from user/first/last if available
  let first = s.first || (s.user ? s.user.split('_')[0] : '');
  let last = s.last || (s.user ? s.user.split('_')[1] : '');
  return `${first}_${last}_Stage1.pdf`;
};

/**
 * Normalize names by converting spaces to underscores and making lowercase
 * 
 * @param {string} name - The name to normalize
 * @returns {string} Normalized name with underscores and lowercase
 */
const normalizeName = (name) => {
  // First replace multiple spaces with single underscores, then trim and lowercase
  return name.replace(/\s+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
};

/**
 * Automatically rename file based on stage progression and current user
 * Extracts the original student name and updates the stage number
 * For reviewer uploads, includes reviewer name in the filename
 * 
 * @param {string} originalFilename - The original filename (e.g., "john_doe_librarian1_Stage2.pdf")
 * @param {string} newStage - The new stage (e.g., "Stage2", "Stage3")
 * @param {string} currentUser - The current user (librarian/reviewer) name
 * @param {boolean} includeUser - Whether to include the current user's name in the filename
 * @returns {string} - The renamed filename (e.g., "john_doe_librarian1_reviewer1_Stage3.pdf")
 */
const autoRenameFile = (originalFilename, newStage, currentUser = null, includeUser = false) => {
  // Extract the base name (everything before the last underscore and stage number)
  const match = originalFilename.match(/^(.+)_Stage\d+\.pdf$/i);
  if (match) {
    const baseName = match[1]; // e.g., "john_doe" or "john_doe_librarian1"
    
    if (includeUser && currentUser) {
      const normalizedUser = normalizeName(currentUser);
      return `${baseName}_${normalizedUser}_${newStage}.pdf`;
    } else {
      return `${baseName}_${newStage}.pdf`;
    }
  }
  // Fallback: if we can't parse the original name, just append the stage
  return originalFilename.replace(/\.pdf$/i, `_${newStage}.pdf`);
};

// --- Main Component ---
export default function FinalApproval() {
  // --- State variables ---
  // Theme, font size, confirmation, sidebar, search, submissions, etc.
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
  const navigate = useNavigate();
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [successMsg, setSuccessMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // --- Constants for layout ---
  const REVIEW_CONTROLS_WIDTH = 350;
  const HORIZONTAL_GAP = 20; // matches the gap and review controls padding
  const CONTAINER_HORIZONTAL_PADDING = 32; // 2rem in px
  const CONTAINER_VERTICAL_PADDING = 40; // 2.5rem in px

  // --- Effects ---
  // Access control: only final reviewers allowed
  useEffect(() => {
    const role = atob(sessionStorage.getItem('authRole') || '');
    const exp = +sessionStorage.getItem('expiresAt') || 0;
    if ((role !== 'reviewer' && role !== 'finalreviewer') || Date.now() > exp) {
      window.alert('Unauthorized');
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
    const rawSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    
    // Convert base64 content back to File objects for display
    const processedSubmissions = rawSubmissions.map(submission => {
      if (submission.content && !submission.file) {
        // Convert legacy base64 to File object
        try {
          let pdfData = submission.content;
          if (pdfData.startsWith('data:')) {
            pdfData = pdfData.split(',')[1];
          }
          pdfData = pdfData.replace(/\s+/g, '');
          
          const binary = atob(pdfData);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const file = new File([blob], submission.filename, { type: 'application/pdf' });
          
          return {
            ...submission,
            file: file,
            content: null // Clear base64 content
          };
        } catch (error) {
          console.error('Error converting base64 to file:', error);
          return submission;
        }
      }
      return submission;
    });
    
    setSubmissions(processedSubmissions);
    setReceipts(JSON.parse(localStorage.getItem('receipts') || '{}'));
    
    // Restore selected document, notes, and scroll position
    const savedSelected = localStorage.getItem('reviewerSelected');
    const savedNotes = localStorage.getItem('reviewerNotes');
    const savedScroll = localStorage.getItem('reviewerScroll');
    if (savedSelected) {
      const found = processedSubmissions.find(s => getDisplayFilename(s) === savedSelected);
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
    if (confirmOn && !window.confirm('Select submission?')) return;
    const newReceipts = { ...receipts, [s.filename]: true };
    setReceipts(newReceipts);
    localStorage.setItem('receipts', JSON.stringify(newReceipts));
    setSelected(s);
    localStorage.setItem('reviewerSelected', getDisplayFilename(s));
  };

  // Approve submission
  const approveSubmission = () => {
    if (!selected) return window.alert('Select one');
    if (confirmOn && !window.confirm('Approve and publish?')) return;
    const updatedSubs = submissions.filter(x => x !== selected);
    
    // Get current reviewer name
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    
    // Automatically rename the file to Stage3 (approved/published) with reviewer name
    const newFilename = autoRenameFile(selected.filename, 'Stage3', currentUser, true);
    const approvedSubmission = { 
      ...selected, 
      stage: 'Stage3', 
      filename: newFilename,
      time: Date.now() 
    };
    updatedSubs.push(approvedSubmission);
    
    // Mark as published (could add a published flag or remove from list)
    localStorage.setItem('submissions', JSON.stringify(updatedSubs));
    setSubmissions(updatedSubs);
    setSelected(null);
    setNotes('');
    setFileInputKey(Date.now()); // Reset file input
    setSuccessMsg('Approved and published!');
    setTimeout(() => setSuccessMsg(''), 5000);
    window.alert('Approved and published!');
  };

  // Send back to librarian
  const sendBackToLibrarian = () => {
    if (!selected) return window.alert('Select one');
    
    // Special confirmation dialog that doesn't depend on confirmOn setting
    const confirmed = window.confirm(
      '⚠️ CAUTION: This will send the submission back to the librarian.\n\n' +
      'This action cannot be undone. Are you sure you want to continue?'
    );
    
    if (!confirmed) return;
    
    const updatedSubs = submissions.filter(x => x !== selected);
    
    // Get current reviewer name
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    
    // Automatically rename the file back to Stage1 with reviewer name and returnedFromReview flag
    const newFilename = autoRenameFile(selected.filename, 'Stage1', currentUser, true);
    const newSel = { 
      ...selected, 
      stage: 'Stage1', 
      filename: newFilename,
      returnedFromReview: true, // Flag to indicate this was sent back from final review
      time: Date.now() 
    };
    updatedSubs.push(newSel);
    localStorage.setItem('submissions', JSON.stringify(updatedSubs));
    setSubmissions(updatedSubs);
    
    // Log the "sent back" action for admin dashboard
    const adminLog = JSON.parse(localStorage.getItem('adminLog') || '[]');
    adminLog.push({
      time: Date.now(),
      user: atob(sessionStorage.getItem('authUser') || ''),
      stage: 'SENT_BACK',
      filename: selected.filename,
      notes: `Sent back to librarian from final review`,
      action: 'sent_back'
    });
    localStorage.setItem('adminLog', JSON.stringify(adminLog));
    
    // Create notification for the librarian
    const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    notifications.push({
      id: notificationId,
      filename: selected.filename,
      targetUser: 'librarian',
      targetStage: 'Stage1',
      time: Date.now(),
      message: `${selected.filename} has been sent back to you for further review.`
    });
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
    
    setSelected(null);
    setNotes('');
    setFileInputKey(Date.now()); // Reset file input
    setSuccessMsg('Sent back to Librarian!');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  // Handle opening document from notification
  const handleOpenDocumentFromNotification = (filename) => {
    const submission = submissions.find(s => s.filename === filename);
    if (submission) {
      setSelected(submission);
      // Scroll to the submission in the sidebar if needed
      const submissionElement = document.querySelector(`[data-filename="${filename}"]`);
      if (submissionElement) {
        submissionElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Download PDF
  const downloadPDF = () => {
    if (!selected) return window.alert('Select a submission first');
    
    try {
      // If we have a File object, use it directly
      if (selected.file instanceof File) {
        const url = URL.createObjectURL(selected.file);
        const link = document.createElement('a');
        link.href = url;
        link.download = selected.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }
      
      // Fallback for legacy base64 data
      if (selected.content) {
        let pdfData = selected.content;
        
        // If it's a data URL, extract the base64 part
        if (pdfData.startsWith('data:')) {
          pdfData = pdfData.split(',')[1];
        }
        
        // Clean the base64 string
        pdfData = pdfData.replace(/\s+/g, '');
        
        // Decode base64 to binary
        const binary = atob(pdfData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        
        // Create blob and download
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = selected.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      window.alert('Error downloading PDF. Please try again.');
    }
  };

  // Preview PDF in new tab
  const previewPDF = () => {
    if (!selected) return window.alert('Select a submission first');
    
    try {
      // If we have a File object, use it directly
      if (selected.file instanceof File) {
        const url = URL.createObjectURL(selected.file);
        window.open(url, '_blank');
        return;
      }
      
      // Fallback for legacy base64 data
      if (selected.content) {
        let pdfData = selected.content;
        
        // If it's a data URL, extract the base64 part
        if (pdfData.startsWith('data:')) {
          pdfData = pdfData.split(',')[1];
        }
        
        // Clean the base64 string
        pdfData = pdfData.replace(/\s+/g, '');
        
        // Create data URL for preview
        const dataUrl = `data:application/pdf;base64,${pdfData}`;
        
        // Open in new tab
        window.open(dataUrl, '_blank');
      }
    } catch (error) {
      console.error('Error previewing PDF:', error);
      window.alert('Error previewing PDF. Please try again.');
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Sanitize input to prevent XSS
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    
    // Remove potentially dangerous HTML tags and attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      .replace(/<input\b[^>]*>/gi, '')
      .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
      .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
      .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<meta\b[^>]*>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/eval\s*\(/gi, '')
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .trim();
  };

  // Validate file size (default max 10MB)
  const validateFileSize = (file, maxSizeMB = 10) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSizeBytes) {
      window.alert(`File size must be under ${maxSizeMB}MB. Current file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }
    return true;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (!selected) {
      window.alert('Please select a submission first');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (!pdfFile) {
      window.alert('Please drop a PDF file');
      return;
    }

    // Validate file size
    if (!validateFileSize(pdfFile)) {
      return;
    }

    // Get current reviewer name
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    
    // For reviewer uploads, we accept any PDF file and will automatically rename it
    // No need to validate the dropped filename against naming conventions
    const droppedFilename = pdfFile.name;

    // Automatically rename the dropped file to include reviewer name and match the current stage
    const newFilename = autoRenameFile(selected.filename, selected.stage, currentUser, true);
    const renamedFile = new File([pdfFile], newFilename, { type: 'application/pdf' });
    
    // Update the submission with the new file
    const updatedSubs = submissions.map(s => {
      if (s.filename === selected.filename) {
        return {
          ...s,
          filename: newFilename, // Update filename to include reviewer name
          file: renamedFile, // Store the renamed File object
          content: null, // Clear legacy base64 content
          time: Date.now()
        };
      }
      return s;
    });
    
    // Convert File objects to base64 for localStorage
    const serializableSubs = await Promise.all(updatedSubs.map(async sub => {
      if (sub.file instanceof File) {
        // Convert File to base64
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(sub.file);
        });
        
        return {
          ...sub,
          content: base64,
          file: null // Remove File object for serialization
        };
      }
      return sub;
    }));
    
    localStorage.setItem('submissions', JSON.stringify(serializableSubs));
    setSubmissions(updatedSubs);
    setSelected(updatedSubs.find(s => s.filename === newFilename));
    setSuccessMsg('PDF updated successfully!');
    setTimeout(() => setSuccessMsg(''), 5000);
  };



  return (
    <div style={{
      ...styles.body(dark, fontSize),
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 0,
      boxSizing: 'border-box',
      background: dark
        ? 'radial-gradient(ellipse at 50% 40%, #231942 0%, #4F2683 80%, #18122b 100%)'
        : 'radial-gradient(ellipse at 50% 40%, #fff 0%, #e9e6f7 80%, #cfc6e6 100%)',
    }}>
      {/* --- Notification System --- */}
      <NotificationSystem 
        dark={dark} 
        onOpenDocument={handleOpenDocumentFromNotification}
      />
      {/* --- Global Styles --- */}
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
      {/* --- Settings Bar --- */}
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
        <label htmlFor="darkModeToggle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input 
            id="darkModeToggle"
            name="darkMode"
            type="checkbox" 
            checked={dark} 
            onChange={e => setDark(e.target.checked)} 
            style={{ display: 'none' }} 
          />
          <span style={styles.slider(dark)}>
            <span style={styles.sliderBefore(dark)}>{dark ? '🌙' : '☀'}</span>
          </span>
          <span style={{ color: dark ? '#e0d6f7' : '#201436', fontWeight: 500 }}>Dark Mode</span>
        </label>
        <label htmlFor="fontSizeSelect" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: dark ? '#e0d6f7' : '#201436', fontWeight: 500 }}>Font Size</span>
          <select 
            id="fontSizeSelect"
            name="fontSize"
            value={fontSize} 
            onChange={e => setFontSize(e.target.value)} 
            style={styles.select(dark)}
          >
            <option value="14px">Default</option>
            <option value="16px">Large</option>
            <option value="12px">Small</option>
          </select>
        </label>
        <label htmlFor="confirmToggle" style={{ display: 'flex', alignItems: 'center', gap: 8, color: dark ? '#e0d6f7' : '#201436', fontWeight: 500 }}>
          <input 
            id="confirmToggle"
            name="confirmOn"
            type="checkbox" 
            checked={confirmOn} 
            onChange={e => setConfirmOn(e.target.checked)} 
          />
          Confirm
        </label>
        <button onClick={handleLogout} style={styles.button(dark, false)}>Logout</button>
      </div>
      {/* --- Sidebar --- */}
      <div style={styles.sidebar(dark, sidebarOpen)}>
        <label htmlFor="searchInput" style={{ display: 'none' }}>Search submissions</label>
        <input
          id="searchInput"
          name="search"
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
      {/* --- Hamburger Menu --- */}
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
      {/* --- Main Content Box --- */}
      <div style={{
        ...styles.main(sidebarOpen),
        width: '100%',
        maxWidth: 900,
        // Increase maxHeight by ~10% (from 500px to 550px)
        maxHeight: 550,
        minHeight: 250,
        height: 'auto',
        // Move the box down (from 64px to 104px)
        margin: '104px auto 24px auto',
        background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255,255,255,0.98)',
        borderRadius: 18,
        boxShadow: dark
          ? '0 8px 40px 0 rgba(79,38,131,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.18)'
          : '0 4px 32px rgba(80,40,130,0.10)',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: '1.2rem 1.2rem',
        // Ensure the box never extends past the bottom of the viewport
        maxHeight: 'calc(100vh - 104px - 24px)', // 104px top margin, 24px bottom margin
      }}>
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
          // Remove marginTop to avoid double spacing
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
            {/* --- PDF Download/Preview/Drop Zone --- */}
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
              <div 
                style={{
                  position: 'relative',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  minWidth: 400,
                  minHeight: 300,
                  border: dragOver ? '3px dashed #4F2683' : '2px solid #ccc',
                  borderRadius: 8,
                  background: dragOver 
                    ? (dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)')
                    : (dark ? '#2a1a3a' : '#f9f9f9'),
                  marginTop: 0,
                  marginBottom: 0,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selected ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                    <h3 style={{ 
                      color: dark ? '#e0d6f7' : '#201436', 
                      marginBottom: '1rem',
                      fontSize: '1.5rem'
                    }}>
                      {selected.filename}
                    </h3>
                    <p style={{ 
                      color: dark ? '#bbaed6' : '#666', 
                      marginBottom: '2rem',
                      fontSize: '1rem'
                    }}>
                      Ready for download and modification
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button
                        onClick={downloadPDF}
                        style={{
                          ...styles.button(dark),
                          padding: '12px 24px',
                          fontSize: '1rem',
                          background: '#4F2683',
                        }}
                      >
                        📥 Download PDF
                      </button>
                      <button
                        onClick={previewPDF}
                        style={{
                          ...styles.button(dark),
                          padding: '12px 24px',
                          fontSize: '1rem',
                          background: '#007bff',
                        }}
                      >
                        👁️ Preview PDF
                      </button>
                      <div style={{ 
                        padding: '12px 24px',
                        border: '2px dashed #4F2683',
                        borderRadius: 8,
                        color: dark ? '#e0d6f7' : '#201436',
                        fontSize: '1rem',
                        textAlign: 'center',
                        minWidth: '200px'
                      }}>
                        📤 Drop modified PDF here
                      </div>
                    </div>
                    {dragOver && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(79, 38, 131, 0.9)',
                        color: '#fff',
                        padding: '1rem 2rem',
                        borderRadius: 8,
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        zIndex: 100,
                      }}>
                        Drop PDF to update
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                    <h3 style={{ 
                      color: dark ? '#e0d6f7' : '#201436', 
                      marginBottom: '1rem',
                      fontSize: '1.5rem'
                    }}>
                      Select a submission
                    </h3>
                    <p style={{ 
                      color: dark ? '#bbaed6' : '#666', 
                      fontSize: '1rem'
                    }}>
                      Choose a document from the sidebar to download and modify
                    </p>
                  </div>
                )}
              </div>
              {/* --- Submission Details Box (only one, below PDF area) --- */}
              {selected && (
                <>
                  <div style={{
                    margin: '18px auto 0 auto',
                    padding: '12px 16px',
                    background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
                    borderRadius: 8,
                    border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
                    fontSize: '0.9rem',
                    color: dark ? '#bbaed6' : '#666',
                    maxWidth: 400,
                    width: '100%',
                    textAlign: 'left',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: dark ? '#e0d6f7' : '#201436' }}>
                      📅 Submission Details
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Submitted:</strong> {new Date(selected.time).toLocaleString()}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <strong>Student:</strong> {selected.user || 'Unknown'}
                    </div>
                    {selected.notes && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${dark ? '#4F2683' : '#bbaed6'}` }}>
                        <strong>Student Notes:</strong> {selected.notes}
                      </div>
                    )}
                  </div>
                  
                  {/* Workflow Progress */}
                  <div style={{ margin: '18px auto 0 auto', maxWidth: 400, width: '100%' }}>
                    <WorkflowProgress 
                      currentStage={selected.stage || 'Stage2'}
                      status={selected.status || 'In Review'}
                      dark={dark}
                      showTimeline={true}
                    />
                  </div>
                </>
              )}
            </div>
            {/* --- Review Controls --- */}
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
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
                <button
                  onClick={approveSubmission}
                  disabled={!selected}
                  style={{
                    ...styles.button(dark),
                    width: '100%',
                    backgroundColor: '#059669',
                    border: '2px solid #059669',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#047857';
                    e.target.style.borderColor = '#047857';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#059669';
                    e.target.style.borderColor = '#059669';
                  }}
                >
                  ✅ Approve Submission
                </button>
                
                <button
                  onClick={sendBackToLibrarian}
                  disabled={!selected}
                  title="⚠️ Send this submission back to the librarian for review"
                  style={{
                    ...styles.button(dark),
                    width: '100%',
                    backgroundColor: '#dc2626',
                    border: '2px solid #dc2626',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#b91c1c';
                    e.target.style.borderColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                    e.target.style.borderColor = '#dc2626';
                  }}
                >
                  <span style={{ marginRight: 8 }}>⚠️</span>
                  Send Back to Librarian
                </button>
                <button
                  onClick={() => {
                    if (!selected) return;
                    if (window.confirm('Are you sure you want to permanently delete this submission? This cannot be undone.')) {
                      // Remove from submissions
                      const updatedSubs = submissions.filter(s => s !== selected);
                      localStorage.setItem('submissions', JSON.stringify(updatedSubs));
                      setSubmissions(updatedSubs);
                      setSelected(null);
                      setNotes('');
                      setFileInputKey(Date.now());
                    }
                  }}
                  disabled={!selected}
                  style={{
                    ...styles.button(dark),
                    width: '100%',
                    backgroundColor: '#6b7280',
                    border: '2px solid #6b7280',
                    color: '#fff',
                    marginTop: 8,
                  }}
                  title="Delete this submission permanently"
                >
                  🗑️ Delete Submission
                </button>
              </div>
            </div>
          </div>
          {successMsg && (
            <div style={{
              background: 'linear-gradient(90deg, #4F2683 0%, #6a4fb6 100%)',
              color: '#fff',
              margin: '1.5rem auto',
              fontWeight: 700,
              fontSize: '1.3rem',
              borderRadius: 8,
              padding: '1rem 2rem',
              textAlign: 'center',
              maxWidth: 400,
              boxShadow: '0 2px 12px rgba(79,38,131,0.15)',
              letterSpacing: '0.5px',
            }}>{successMsg}</div>
          )}
        </div>
      </div>
    </div>
  );
}