// --- LibrarianReview.js ---
// React component for the librarian review stage of the workflow system.
// Handles PDF review, download, preview, drag-and-drop, and submission management.
// Librarians can approve submissions to send to final reviewers or return them to students.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationSystem from './NotificationSystem';
import WorkflowProgress from './WorkflowProgress';
import FileUpload from './FileUpload';

/**
 * LibrarianReview Component - Comprehensive Styling Object
 * 
 * This object contains all the styling for the librarian review page.
 * Each style function takes theme parameters (dark/light mode) and returns
 * appropriate CSS properties for responsive, accessible design.
 */
const styles = {
  // Full-screen background with gradient based on theme
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
  // Settings bar positioned in top-right corner for theme and font controls
  settingsBar: {
    position: 'fixed',
    top: 15,
    right: 20,
    display: 'flex',
    gap: '1rem',
    zIndex: 1000,
    alignItems: 'center',
  },
  // Dark/light mode toggle slider styling
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
  // Slider button (sun/moon icon) styling with smooth transitions
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
  // Font size selector dropdown styling
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
  // Main form container with glass-morphism effect
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
  // Main heading styling with bold font and proper spacing
  h1: dark => ({
    fontFamily: "'BentonSans Bold'",
    color: dark ? '#e0d6f7' : '#201436',
    fontSize: '2rem',
    marginBottom: '1.5rem',
    letterSpacing: '-1px',
    transition: 'color .3s',
  }),
  // Sidebar for submission list with slide-in animation
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
  // Search input in sidebar for filtering submissions
  sidebarInput: dark => ({
    width: '100%',
    padding: '.85rem 1rem',
    marginTop: 10, // Reduced to move search bar up closer to tab navigation
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
  // Individual submission item in sidebar list
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
  // Main content area that adjusts based on sidebar state
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
  // PDF viewer container for displaying uploaded documents
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
  // Textarea for librarian comments and notes
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
  // File input for uploading new PDFs
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
  // Primary action button styling
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
  // Checkbox for confirmation settings
  checkbox: dark => ({
    width: 16,
    height: 16,
    accentColor: dark ? '#4F2683' : '#a259e6',
    cursor: 'pointer',
  }),
  // Label for form elements
  label: dark => ({
    display: 'block',
    marginBottom: 6,
    color: dark ? '#e0d6f7' : '#201436',
    fontWeight: 500,
    fontSize: '1rem',
    letterSpacing: '-0.5px',
  }),
  // Keyframes for fade-in animation
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'none' },
  },
  // Hamburger menu icon styling
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
  // Individual bar of the hamburger menu
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

/**
 * Helper function to get display filename from submission object
 * 
 * This function extracts or constructs a proper filename for display purposes.
 * It handles both direct filename properties and constructs filenames from user data.
 * 
 * @param {Object} s - Submission object
 * @returns {string} - Formatted filename for display
 */
const getDisplayFilename = (s) => {
  if (!s) return '';
  if (s.filename && s.filename.match(/^.+_.+_Stage1\.pdf$/i)) return s.filename;
  // Try to parse from user/first/last if available
  let first = s.first || (s.user ? s.user.split('_')[0] : '');
  let last = s.last || (s.user ? s.user.split('_')[1] : '');
  return `${first}_${last}_Stage1.pdf`;
};

/**
 * Get display filename with line breaks for long names
 * Returns an object with filename and display text
 */
const getDisplayFilenameWithBreaks = (s) => {
  const filename = getDisplayFilename(s);
  
  // Extract the base name (before "_Stage" and ".pdf")
  const baseNameMatch = filename.match(/^(.+)_Stage\d+\.pdf$/i);
  const baseName = baseNameMatch ? baseNameMatch[1] : filename.replace(/\.pdf$/i, '');
  
  // If base name is longer than 32 characters, add line breaks
  if (baseName.length > 32) {
    // Split the base name into chunks of 32 characters
    const chunks = [];
    for (let i = 0; i < baseName.length; i += 32) {
      chunks.push(baseName.slice(i, i + 32));
    }
    
    // Join chunks with line breaks and add the stage suffix
    const stageSuffix = filename.replace(baseName, '');
    const displayText = chunks.join('\n') + stageSuffix;
    
    return {
      filename,
      displayText,
      hasBreaks: true
    };
  }
  
  return {
    filename,
    displayText: filename,
    hasBreaks: false
  };
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
 * Automatically rename file based on stage progression
 * Extracts the original student name and updates the stage number
 * Clean naming convention: firstname_lastname_StageX.pdf
 * 
 * @param {string} originalFilename - The original filename (e.g., "john_doe_Stage1.pdf")
 * @param {string} newStage - The new stage (e.g., "Stage2", "Stage3")
 * @param {string} currentUser - The current user (librarian/reviewer) name (not used in filename)
 * @param {boolean} includeUser - Whether to include the current user's name in the filename (ignored)
 * @returns {string} - The renamed filename (e.g., "john_doe_Stage2.pdf")
 */
const autoRenameFile = (originalFilename, newStage, currentUser = null, includeUser = false) => {
  // Extract the base name (everything before the last underscore and stage number)
  const match = originalFilename.match(/^(.+)_Stage\d+\.pdf$/i);
  if (match) {
    const baseName = match[1]; // e.g., "john_doe"
    return `${baseName}_${newStage}.pdf`;
  }
  // Fallback: if we can't parse the original name, just append the stage
  return originalFilename.replace(/\.pdf$/i, `_${newStage}.pdf`);
};

/**
 * LibrarianReview Component
 * 
 * This component handles the librarian review stage of the PDF workflow system.
 * Librarians can:
 * - View and select student submissions
 * - Download and preview PDFs
 * - Add comments and notes
 * - Send submissions to final reviewers
 * - Return submissions to students for corrections
 * - Upload replacement PDFs via drag-and-drop
 * 
 * Features:
 * - Dark/light theme support
 * - Responsive sidebar with submission list
 * - File validation and security measures
 * - Drag-and-drop file upload
 * - Notification system integration
 * - Persistent state management
 */
export default function LibrarianReview() {
  // UI state management
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark'); // Dark/light theme
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px'); // Font size preference
  const [confirmOn, setConfirmOn] = useState(localStorage.getItem('confirmOn') !== 'false'); // Confirmation dialogs
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar visibility
  const [search, setSearch] = useState(''); // Search filter for submissions
  const [settingsOpen, setSettingsOpen] = useState(false); // Settings panel visibility
  const [activeTab, setActiveTab] = useState('to-review'); // Active tab: 'to-review', 'returned', 'sent', or 'sent-back'
  
  // Data state management
  const [submissions, setSubmissions] = useState([]); // All submissions from localStorage
  const [receipts, setReceipts] = useState({}); // Read receipts for submissions
  const [selected, setSelected] = useState(null); // Currently selected submission
  
  // Form state management
  const [notes, setNotes] = useState(''); // Librarian comments/notes
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Key to reset file input
  const [successMsg, setSuccessMsg] = useState(''); // Success message display
  
  // UI interaction state
  const [hoverIdx, setHoverIdx] = useState(-1); // Hover state for submission items
  const [btnHover, setBtnHover] = useState(false); // Button hover state
  const [dragOver, setDragOver] = useState(false); // Drag-and-drop state
  
  // Navigation and utilities
  const navigate = useNavigate(); // React Router navigation hook
  
  // Real-time notification state
  const [notificationCounts, setNotificationCounts] = useState({});

  const REVIEW_CONTROLS_WIDTH = 350;
  const HORIZONTAL_GAP = 20; // matches the gap and review controls padding
  const CONTAINER_HORIZONTAL_PADDING = 32; // 2rem in px
  const CONTAINER_VERTICAL_PADDING = 40; // 2.5rem in px

  // Access control: verify user is authenticated as a librarian
  useEffect(() => {
    const role = atob(sessionStorage.getItem('authRole') || ''); // Decode role from base64
    const exp = +sessionStorage.getItem('expiresAt') || 0; // Get session expiration time
    if (role !== 'librarian' || Date.now() > exp) {
      window.alert('Unauthorized'); // Show error if not librarian or session expired
      navigate('/login'); // Redirect to login page
    }
  }, [navigate]);

  // Persist user preferences to localStorage and apply to document
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize; // Apply font size to document
    localStorage.setItem('theme', dark ? 'dark' : 'light'); // Save theme preference
    localStorage.setItem('fontSize', fontSize); // Save font size preference
    localStorage.setItem('confirmOn', confirmOn); // Save confirmation dialog preference
  }, [dark, fontSize, confirmOn]);

  // Load submissions from localStorage and restore application state
  useEffect(() => {
    const rawSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]'); // Get raw submissions
    
    // Convert base64 content back to File objects for display and interaction
    const processedSubmissions = rawSubmissions.map(submission => {
      if (submission.content && !submission.file) {
        // Convert legacy base64 to File object for better user experience
        try {
          let pdfData = submission.content;
          if (pdfData.startsWith('data:')) {
            pdfData = pdfData.split(',')[1]; // Remove data URL prefix
          }
          pdfData = pdfData.replace(/\s+/g, ''); // Remove whitespace
          
          const binary = atob(pdfData); // Decode base64 to binary
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i); // Convert to byte array
          }
          
          const blob = new Blob([bytes], { type: 'application/pdf' }); // Create blob
          const file = new File([blob], submission.filename, { type: 'application/pdf' }); // Create File object
          
          return {
            ...submission,
            file: file, // Add File object for immediate use
            content: null // Clear base64 content to save memory
          };
        } catch (error) {
          console.error('Error converting base64 to file:', error);
          return submission; // Return original if conversion fails
        }
      }
      return submission;
    });
    
    setSubmissions(processedSubmissions); // Set processed submissions
    setReceipts(JSON.parse(localStorage.getItem('receipts') || '{}')); // Load read receipts
    
    // Restore previous session state (selected document, notes, scroll position)
    const savedSelected = localStorage.getItem('librarianSelected');
    const savedNotes = localStorage.getItem('librarianNotes');
    const savedScroll = localStorage.getItem('librarianScroll');
    if (savedSelected) {
      const found = processedSubmissions.find(s => getDisplayFilename(s) === savedSelected);
      if (found) setSelected(found); // Restore selected submission
    }
    if (savedNotes) setNotes(savedNotes); // Restore notes
    if (savedScroll) window.scrollTo(0, parseInt(savedScroll, 10)); // Restore scroll position
  }, []);

  // Persist notes, selected, and scroll position
  useEffect(() => {
    if (selected) localStorage.setItem('librarianSelected', getDisplayFilename(selected));
    if (notes !== undefined) localStorage.setItem('librarianNotes', notes);
    const onScroll = () => localStorage.setItem('librarianScroll', window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [selected, notes]);

  // Auto-refresh submissions every second when user is online
  useEffect(() => {
    const refreshSubmissions = () => {
      const rawSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
      
      // Convert base64 content back to File objects for display and interaction
      const processedSubmissions = rawSubmissions.map(submission => {
        if (submission.content && !submission.file) {
          // Convert legacy base64 to File object for better user experience
          try {
            let pdfData = submission.content;
            if (pdfData.startsWith('data:')) {
              pdfData = pdfData.split(',')[1]; // Remove data URL prefix
            }
            pdfData = pdfData.replace(/\s+/g, ''); // Remove whitespace
            
            const binary = atob(pdfData); // Decode base64 to binary
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i); // Convert to byte array
            }
            
            const blob = new Blob([bytes], { type: 'application/pdf' }); // Create blob
            const file = new File([blob], submission.filename, { type: 'application/pdf' }); // Create File object
            
            return {
              ...submission,
              file: file, // Add File object for immediate use
              content: null // Clear base64 content to save memory
            };
          } catch (error) {
            console.error('Error converting base64 to file:', error);
            return submission; // Return original if conversion fails
          }
        }
        return submission;
      });
      
      setSubmissions(processedSubmissions);
    };

    // Set up interval for auto-refresh (every 1 second)
    const intervalId = setInterval(refreshSubmissions, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Filtered submissions based on active tab, sorted by submission time (oldest first)
  const filtered = submissions.filter(s => {
    const matchesSearch = !search || s.filename.toLowerCase().includes(search.toLowerCase());
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    
    if (activeTab === 'to-review') {
      // Documents that need to be reviewed by the current user
      return s.stage === 'Stage1' && !s.returnedFromReview && matchesSearch;
    } else if (activeTab === 'returned') {
      // Documents that have been returned to the current user from someone else
      return s.stage === 'Stage1' && s.returnedFromReview && matchesSearch;
    } else if (activeTab === 'sent') {
      // Documents that the current user has sent to someone else
      return s.stage === 'Stage2' && s.filename.includes(currentUser) && matchesSearch;
    } else if (activeTab === 'sent-back') {
      // Documents that the current user has sent back to someone else
      return s.stage === 'Stage0' && s.sentBackBy === currentUser && matchesSearch;
    }
    return false;
  }).sort((a, b) => a.time - b.time); // Sort by submission time, oldest first

  // Select a submission
  const selectSubmission = (s, idx) => {
    if (confirmOn && !window.confirm('Select submission?')) return;
    const newReceipts = { ...receipts, [s.filename]: true };
    setReceipts(newReceipts);
    localStorage.setItem('receipts', JSON.stringify(newReceipts));
    setSelected(s);
    localStorage.setItem('librarianSelected', getDisplayFilename(s));
  };

  // Send to reviewer
  const sendToReviewer = async () => {
    if (!selected) return window.alert('Select one');
    if (confirmOn && !window.confirm('Send to reviewer?')) return;
    const updatedSubs = submissions.filter(x => x !== selected);
    
    // Get current librarian name
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    
    // Automatically rename the file to Stage2
    const newFilename = autoRenameFile(selected.filename, 'Stage2', currentUser, false);
    const newSel = { 
      ...selected, 
      stage: 'Stage2', 
      filename: newFilename,
      time: Date.now() 
    };
    updatedSubs.push(newSel);
    
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
    setSelected(null);
    setNotes('');
    setFileInputKey(Date.now()); // Reset file input
    setSuccessMsg('Sent to Reviewer!');
    setTimeout(() => setSuccessMsg(''), 5000);
    window.alert('Sent to Reviewer');
  };

  // Send returned document back to final review
  const sendReturnedToFinalReview = async () => {
    if (!selected) return window.alert('Select one');
    if (confirmOn && !window.confirm('Send returned document back to final review?')) return;
    const updatedSubs = submissions.filter(x => x !== selected);
    
    // Get current librarian name
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    
    // Automatically rename the file to Stage2
    const newFilename = autoRenameFile(selected.filename, 'Stage2', currentUser, false);
    const newSel = { 
      ...selected, 
      stage: 'Stage2', 
      filename: newFilename,
      time: Date.now(),
      returnedFromReview: false // Remove the returnedFromReview flag
    };
    updatedSubs.push(newSel);
    
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
    setSelected(null);
    setNotes('');
    setFileInputKey(Date.now()); // Reset file input
    setSuccessMsg('Sent to Final Review!');
    setTimeout(() => setSuccessMsg(''), 5000);
    window.alert('Sent to Final Review');
  };

  // Send back to student
  const sendBackToStudent = async () => {
    if (!selected) return window.alert('Select one');
    
    // Special confirmation dialog that doesn't depend on confirmOn setting
    const confirmed = window.confirm(
      '⚠️ CAUTION: This will send the submission back to the student.\n\n' +
      'This action cannot be undone. Are you sure you want to continue?'
    );
    
    if (!confirmed) return;
    
    const updatedSubs = submissions.filter(x => x !== selected);
    
    // Automatically rename the file back to Stage0
    const newFilename = autoRenameFile(selected.filename, 'Stage0');
    const newSel = { 
      ...selected, 
      stage: 'Stage0', 
      filename: newFilename,
      time: Date.now() 
    };
    updatedSubs.push(newSel);
    
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
    
    // Log the "sent back" action for admin dashboard
    const adminLog = JSON.parse(localStorage.getItem('adminLog') || '[]');
    adminLog.push({
      time: Date.now(),
      user: atob(sessionStorage.getItem('authUser') || ''),
      stage: 'SENT_BACK',
      filename: selected.filename,
      notes: `Sent back to student: ${selected.user}`,
      action: 'sent_back'
    });
    localStorage.setItem('adminLog', JSON.stringify(adminLog));
    
    // Create notification for the student
    const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    notifications.push({
      id: notificationId,
      filename: selected.filename,
      targetUser: selected.user,
      targetStage: 'Stage0',
      time: Date.now(),
      message: `${selected.filename} has been sent back to you for review.`
    });
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
    
    setSelected(null);
    setNotes('');
    setFileInputKey(Date.now()); // Reset file input
    setSuccessMsg('Sent back to Student!');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Clear submission history for the current user
  const clearHistory = () => {
    if (!window.confirm('Are you sure you want to clear your submission history? This action cannot be undone.')) {
      return;
    }
    
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    const updatedSubs = submissions.filter(s => !(s.stage === 'Stage2' && s.filename.includes(currentUser)));
    
    localStorage.setItem('submissions', JSON.stringify(updatedSubs));
    setSubmissions(updatedSubs);
    setSelected(null);
    setNotes('');
    setSuccessMsg('Submission history cleared!');
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

    // Get current librarian name
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    
    // For librarian uploads, we accept any PDF file and will automatically rename it
    // No need to validate the dropped filename against naming conventions
    const droppedFilename = pdfFile.name;

    // Automatically rename the dropped file to match the current stage
    const newFilename = autoRenameFile(selected.filename, selected.stage, currentUser, false);
    const renamedFile = new File([pdfFile], newFilename, { type: 'application/pdf' });
    
    // Update the submission with the new file
    const updatedSubs = submissions.map(s => {
      if (s.filename === selected.filename) {
        return {
          ...s,
          filename: newFilename, // Update filename to match stage
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
            <NotificationSystem 
        dark={dark} 
        onOpenDocument={handleOpenDocumentFromNotification}
        onNotificationUpdate={setNotificationCounts}
      />
      {/* CSS animations for real-time notification badges */}
      <style>
        {`
          @keyframes badgePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
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
      {/* Sidebar */}
      <div style={styles.sidebar(dark, sidebarOpen)}>
        {/* Tab Navigation - Vertical Layout */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '90px', // Align with bottom of settings panel
          marginBottom: '1rem',
          borderBottom: `1px solid ${dark ? '#4a5568' : '#e2e8f0'}`,
        }}>
          <button
            onClick={() => {
              setActiveTab('to-review');
              setSelected(null);
              setNotes('');
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              marginBottom: '0.5rem',
              background: activeTab === 'to-review' ? (dark ? '#4F2683' : '#a259e6') : 'transparent',
              color: activeTab === 'to-review' ? '#fff' : (dark ? '#e0d6f7' : '#201436'),
              border: '1.5px solid #bbaed6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: "'BentonSans Book'",
              fontSize: '0.9rem',
              fontWeight: activeTab === 'to-review' ? 600 : 400,
              transition: 'all 0.3s ease',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            📋 To Review ({notificationCounts.workflow?.toReview || submissions.filter(s => s.stage === 'Stage1' && !s.returnedFromReview).length})
            {/* Notification badge */}
            {(() => {
              const count = notificationCounts.workflow?.toReview || submissions.filter(s => s.stage === 'Stage1' && !s.returnedFromReview).length;
              if (count > 0) {
                return (
                  <div style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: '#ff3b30',
                    color: '#ffffff',
                    borderRadius: '50%',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '2px solid rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 2px 6px rgba(255, 59, 48, 0.3)',
                    zIndex: 1,
                    animation: count > 0 ? 'badgePulse 2s ease-in-out infinite' : 'none',
                  }}>
                    {Math.min(count, 999)}
                  </div>
                );
              }
              return null;
            })()}
          </button>
          <button
            onClick={() => {
              setActiveTab('returned');
              setSelected(null);
              setNotes('');
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              marginBottom: '0.5rem',
              background: activeTab === 'returned' ? (dark ? '#4F2683' : '#a259e6') : 'transparent',
              color: activeTab === 'returned' ? '#fff' : (dark ? '#e0d6f7' : '#201436'),
              border: '1.5px solid #bbaed6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: "'BentonSans Book'",
              fontSize: '0.9rem',
              fontWeight: activeTab === 'returned' ? 600 : 400,
              transition: 'all 0.3s ease',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            ↩️ Returned to Me ({notificationCounts.workflow?.returned || submissions.filter(s => s.stage === 'Stage1' && s.returnedFromReview).length})
            {/* Notification badge */}
            {(() => {
              const count = notificationCounts.workflow?.returned || submissions.filter(s => s.stage === 'Stage1' && s.returnedFromReview).length;
              if (count > 0) {
                return (
                  <div style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: '#ff3b30',
                    color: '#ffffff',
                    borderRadius: '50%',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '2px solid rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 2px 6px rgba(255, 59, 48, 0.3)',
                    zIndex: 1,
                    animation: count > 0 ? 'badgePulse 2s ease-in-out infinite' : 'none',
                  }}>
                    {Math.min(count, 999)}
                  </div>
                );
              }
              return null;
            })()}
          </button>
          <button
            onClick={() => {
              setActiveTab('sent');
              setSelected(null);
              setNotes('');
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              marginBottom: '0.5rem',
              background: activeTab === 'sent' ? (dark ? '#4F2683' : '#a259e6') : 'transparent',
              color: activeTab === 'sent' ? '#fff' : (dark ? '#e0d6f7' : '#201436'),
              border: '1.5px solid #bbaed6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: "'BentonSans Book'",
              fontSize: '0.9rem',
              fontWeight: activeTab === 'sent' ? 600 : 400,
              transition: 'all 0.3s ease',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            📤 Submission History ({notificationCounts.workflow?.sent || submissions.filter(s => s.stage === 'Stage2' && s.filename.includes(atob(sessionStorage.getItem('authUser') || ''))).length})
            {/* Notification badge */}
            {(() => {
              const count = notificationCounts.workflow?.sent || submissions.filter(s => s.stage === 'Stage2' && s.filename.includes(atob(sessionStorage.getItem('authUser') || ''))).length;
              if (count > 0) {
                return (
                  <div style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: '#ff3b30',
                    color: '#ffffff',
                    borderRadius: '50%',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '2px solid rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 2px 6px rgba(255, 59, 48, 0.3)',
                    zIndex: 1,
                    animation: count > 0 ? 'badgePulse 2s ease-in-out infinite' : 'none',
                  }}>
                    {Math.min(count, 999)}
                  </div>
                );
              }
              return null;
            })()}
          </button>
          {/* Clear History Button - only show when on sent tab */}
          {activeTab === 'sent' && (
            <button
              onClick={clearHistory}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                marginBottom: '0.5rem',
                background: '#dc2626',
                color: '#ffffff',
                border: '1.5px solid #dc2626',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: "'BentonSans Book'",
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                textAlign: 'center',
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
              🗑️ Clear History
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('sent-back');
              setSelected(null);
              setNotes('');
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              marginBottom: '0.5rem',
              background: activeTab === 'sent-back' ? (dark ? '#4F2683' : '#a259e6') : 'transparent',
              color: activeTab === 'sent-back' ? '#fff' : (dark ? '#e0d6f7' : '#201436'),
              border: '1.5px solid #bbaed6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: "'BentonSans Book'",
              fontSize: '0.9rem',
              fontWeight: activeTab === 'sent-back' ? 600 : 400,
              transition: 'all 0.3s ease',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            🔄 Returned to Student ({notificationCounts.workflow?.sentBack || submissions.filter(s => s.stage === 'Stage0' && s.sentBackBy === atob(sessionStorage.getItem('authUser') || '')).length})
            {/* Notification badge */}
            {(() => {
              const count = notificationCounts.workflow?.sentBack || submissions.filter(s => s.stage === 'Stage0' && s.sentBackBy === atob(sessionStorage.getItem('authUser') || '')).length;
              if (count > 0) {
                return (
                  <div style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: '#ff3b30',
                    color: '#ffffff',
                    borderRadius: '50%',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '2px solid rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 2px 6px rgba(255, 59, 48, 0.3)',
                    zIndex: 1,
                    animation: count > 0 ? 'badgePulse 2s ease-in-out infinite' : 'none',
                  }}>
                    {Math.min(count, 999)}
                  </div>
                );
              }
              return null;
            })()}
          </button>
        </div>
        
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
          {filtered.map((s, i) => {
            const displayInfo = getDisplayFilenameWithBreaks(s);
            return (
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
                <span style={{ 
                  whiteSpace: displayInfo.hasBreaks ? 'pre-line' : 'nowrap',
                  lineHeight: displayInfo.hasBreaks ? '1.2' : 'normal'
                }}>
                  {displayInfo.displayText}
                </span>
              </div>
            );
          })}
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
      <div style={{
        ...styles.main(sidebarOpen),
        width: '100%',
        maxWidth: 900,
        // Increase maxHeight by ~10% (from 500px to 550px)
        maxHeight: 550,
        minHeight: 250,
        height: 'auto',
        // Move the box down by another 5% (from 99px to 104px)
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
          <h1 style={styles.h1(dark)}>
            {activeTab === 'to-review' ? 'To Review' : 
             activeTab === 'returned' ? 'Returned to Me' : 
             activeTab === 'sent' ? 'Submission History' :
             'Returned to Student'}
          </h1>
          <div style={{ fontWeight: 500, marginBottom: 12 }}>
            {selected ? (() => {
              const displayInfo = getDisplayFilenameWithBreaks(selected);
              return (
                <span style={{ 
                  whiteSpace: displayInfo.hasBreaks ? 'pre-line' : 'nowrap',
                  lineHeight: displayInfo.hasBreaks ? '1.2' : 'normal'
                }}>
                  {displayInfo.displayText}
                </span>
              );
            })() : ''}
          </div>
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
              {/* PDF Download & Drop Zone - Left Side */}
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
                  border: '2px solid #ccc',
                  borderRadius: 8,
                  background: dark ? '#2a1a3a' : '#f9f9f9',
                  marginTop: 0,
                  marginBottom: 0,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                {selected ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                    <h3 style={{ 
                      color: dark ? '#e0d6f7' : '#201436', 
                      marginBottom: '1rem',
                      fontSize: '1.5rem'
                    }}>
                      {selected ? (() => {
                        const displayInfo = getDisplayFilenameWithBreaks(selected);
                        return (
                          <span style={{ 
                            whiteSpace: displayInfo.hasBreaks ? 'pre-line' : 'nowrap',
                            lineHeight: displayInfo.hasBreaks ? '1.3' : 'normal'
                          }}>
                            {displayInfo.displayText}
                          </span>
                        );
                      })() : selected.filename}
                    </h3>
                    <p style={{ 
                      color: dark ? '#bbaed6' : '#666', 
                      marginBottom: '2rem',
                      fontSize: '1rem'
                    }}>
                      {activeTab === 'to-review' ? 'Ready for download and modification' : 
                       activeTab === 'returned' ? 'Returned document ready for download and review' :
                       activeTab === 'sent' ? 'Document in submission history - available for download' :
                       'Document you returned to student - available for download'}
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
                          background: '#6a4fb6',
                        }}
                      >
                        👁️ Preview PDF
                      </button>
                      <div 
                        style={{ 
                          padding: '12px 24px',
                          border: dragOver ? '3px dashed #4F2683' : '2px dashed #4F2683',
                          borderRadius: 8,
                          color: dark ? '#e0d6f7' : '#201436',
                          fontSize: '1rem',
                          textAlign: 'center',
                          minWidth: '200px',
                          background: dragOver ? (dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)') : 'transparent',
                          transition: 'all 0.3s ease',
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
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
                      {activeTab === 'to-review' ? 'Select a submission' : 
                       activeTab === 'returned' ? 'Select a returned document' :
                       activeTab === 'sent' ? 'Select a document from history' :
                       'Select a returned document'}
                    </h3>
                    <p style={{ 
                      color: dark ? '#bbaed6' : '#666', 
                      fontSize: '1rem'
                    }}>
                      {activeTab === 'to-review' ? 'Choose a document from the sidebar to download and modify' : 
                       activeTab === 'returned' ? 'Choose a returned document from the sidebar to review' :
                       activeTab === 'sent' ? 'Choose a document from your submission history' :
                       'Choose a document you returned to a student'}
                    </p>
                  </div>
                )}
              </div>
              {/* Submission Details - Directly below PDF area, inside left column */}
              {selected && (
                <>
                  <div style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
                    borderRadius: 8,
                    border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
                    fontSize: '0.9rem',
                    color: dark ? '#bbaed6' : '#666',
                    width: '100%',
                    boxSizing: 'border-box',
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
                  {/* Progress Bar - In its own box below submission details */}
                  <div style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
                    borderRadius: 8,
                    border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}>
                    <WorkflowProgress 
                      currentStage={selected.stage || 'Stage1'}
                      status={selected.status || 'In Review'}
                      dark={dark}
                      showTimeline={true}
                    />
                  </div>
                </>
              )}
            </div>
            
            {/* Controls - Right Side */}
            <div style={{
              width: REVIEW_CONTROLS_WIDTH,
              minWidth: REVIEW_CONTROLS_WIDTH,
              maxWidth: REVIEW_CONTROLS_WIDTH,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              padding: 20,
              backgroundColor: dark ? '#2d3748' : '#f7fafc',
              borderRadius: 12,
              border: `1px solid ${dark ? '#4a5568' : '#e2e8f0'}`,
              height: 'fit-content',
              maxHeight: '100%',
              overflowY: 'auto',
              position: 'sticky',
              top: 0,
              alignSelf: 'flex-start',
              zIndex: 20,
              boxSizing: 'border-box',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: dark ? '#e2e8f0' : '#2d3748',
              }}>
                {activeTab === 'to-review' ? 'Review Controls' : 
                 activeTab === 'returned' ? 'Returned Document Controls' :
                 activeTab === 'sent' ? 'Sent Documents' :
                 'Returned to Student Documents'}
              </h3>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: dark ? '#e2e8f0' : '#4a5568',
                }}>
                  Notes:
                </label>
                <textarea
                  placeholder="Enter your notes here..."
                  value={notes}
                  onChange={e => {
                    setNotes(e.target.value);
                    // Auto-grow logic
                    const ta = e.target;
                    ta.style.height = 'auto';
                    ta.style.height = ta.scrollHeight + 'px';
                  }}
                  style={{
                    ...styles.textarea(dark),
                    width: '100%',
                    minHeight: 120,
                    resize: 'none', // Remove manual resize
                    overflow: 'hidden',
                  }}
                  ref={el => {
                    if (el) {
                      el.style.height = 'auto';
                      el.style.height = el.scrollHeight + 'px';
                    }
                  }}
                  onBlur={e => localStorage.setItem('librarianNotes', e.target.value)}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={confirmOn}
                  onChange={e => setConfirmOn(e.target.checked)}
                  style={styles.checkbox(dark)}
                />
                <label style={{
                  ...styles.label(dark),
                  fontSize: 14,
                  margin: 0,
                }}>
                  Confirm before opening submissions
                </label>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
                {activeTab === 'to-review' && (
                  <>
                    <button
                      onClick={sendToReviewer}
                      disabled={!selected}
                      style={{
                        ...styles.button(dark),
                        width: '100%',
                        backgroundColor: '#059669',
                        border: '2px solid #059669',
                      }}
                    >
                      📤 Send to Review
                    </button>
                    
                    <button
                      onClick={sendBackToStudent}
                      disabled={!selected}
                      title="⚠️ Send this submission back to the student for corrections"
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
                      Send Back to Student
                    </button>
                  </>
                )}
                
                {activeTab === 'returned' && (
                  <>
                    <button
                      onClick={sendReturnedToFinalReview}
                      disabled={!selected}
                      style={{
                        ...styles.button(dark),
                        width: '100%',
                        backgroundColor: '#059669',
                        border: '2px solid #059669',
                      }}
                      title="Send this returned document back to final review"
                    >
                      📤 Send to Review
                    </button>
                    
                    <button
                      onClick={sendBackToStudent}
                      disabled={!selected}
                      title="⚠️ Send this submission back to the student for corrections"
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
                      Send Back to Student
                    </button>
                  </>
                )}
                
                {activeTab === 'sent' && (
                  <div style={{ 
                    color: dark ? '#bbaed6' : '#666', 
                    fontSize: '0.9rem', 
                    textAlign: 'center',
                    padding: '12px',
                    fontStyle: 'italic',
                    background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
                    borderRadius: '8px',
                    border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`
                  }}>
                    Documents you sent to final review
                  </div>
                )}
                
                {activeTab === 'sent-back' && (
                  <div style={{ 
                    color: dark ? '#bbaed6' : '#666', 
                    fontSize: '0.9rem', 
                    textAlign: 'center',
                    padding: '12px',
                    fontStyle: 'italic',
                    background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
                    borderRadius: '8px',
                    border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`
                  }}>
                    Documents you returned to students
                  </div>
                )}
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
          
          {/* Submission Details - Below PDF area, aligned with review controls */}
          {/* This block is now moved inside the left column */}
          
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
          {/* Workflow Progress */}
          {/* This block is now moved inside the left column */}
          
        </div>
      </div>
      {/* After the main flex row, render the progress bar as a floating box in the right gutter */}
      {/* This block is now moved inside the left column */}
      
    </div>
  );
} 