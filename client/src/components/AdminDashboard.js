// --- AdminDashboard.js ---
// React component for the admin dashboard of the workflow system.
// Provides overview of all submissions, admin logs, and system management tools.
// Admins can view submission history, add sample data, and monitor workflow progress.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkflowProgress from './WorkflowProgress';

/**
 * AdminDashboard Component
 * 
 * This component provides administrative oversight of the entire PDF workflow system.
 * Admins can:
 * - View all submissions across all stages
 * - Monitor workflow progress and timing
 * - Access admin logs and system events
 * - Add sample data for testing
 * - Refresh data in real-time
 * 
 * Features:
 * - Dark/light theme support
 * - Real-time data refresh
 * - Comprehensive submission tracking
 * - Sample data generation
 * - Responsive table layout
 */
export default function AdminDashboard() {
  // UI state management
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark'); // Dark/light theme
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px'); // Font size preference
  
  // Data state management
  const [submissions, setSubmissions] = useState([]); // All submissions and admin logs
  
  // Navigation and utilities
  const navigate = useNavigate(); // React Router navigation hook

  // Access control: verify user is authenticated as an admin
  useEffect(() => {
    const role = atob(sessionStorage.getItem('authRole') || ''); // Decode role from base64
    const exp = +sessionStorage.getItem('expiresAt') || 0; // Get session expiration time
    if (role !== 'admin' || Date.now() > exp) {
      window.alert('Unauthorized'); // Show error if not admin or session expired
      navigate('/login'); // Redirect to login page
    }
  }, [navigate]);

  // Persist user preferences to localStorage and apply to document
  useEffect(() => {
    document.body.classList.toggle('dark-mode', dark); // Apply dark mode class
    document.documentElement.style.fontSize = fontSize; // Apply font size to document
    localStorage.setItem('theme', dark ? 'dark' : 'light'); // Save theme preference
    localStorage.setItem('fontSize', fontSize); // Save font size preference
    return () => {
      document.body.classList.remove('dark-mode'); // Cleanup dark mode class
      document.documentElement.style.fontSize = ''; // Reset font size
    };
  }, [dark, fontSize]);

  // Load submissions and admin logs from localStorage
  useEffect(() => {
    const storedSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]'); // Get submissions
    const adminLog = JSON.parse(localStorage.getItem('adminLog') || '[]'); // Get admin logs
    console.log('Loaded submissions:', storedSubmissions); // Debug log
    console.log('Loaded admin log:', adminLog); // Debug log
    
    // Combine submissions with admin logs for comprehensive display
    const allEntries = [...storedSubmissions, ...adminLog];
    allEntries.sort((a, b) => b.time - a.time); // Sort by time, newest first
    
    // Add a flag to distinguish between submissions and admin logs
    const processedEntries = allEntries.map(entry => ({
      ...entry,
      isSubmission: !entry.action && (entry.content || entry.file) && entry.filename, // Use either content or file
      isAdminLog: !!entry.action
    }));
    
    console.log('Processed entries:', processedEntries);
    setSubmissions(processedEntries); // Set combined data
  }, []);

  /**
   * Handle user logout by clearing session data and redirecting to login
   */
  const handleLogout = () => {
    sessionStorage.clear(); // Clear all session storage (auth data, etc.)
    navigate('/login'); // Redirect to login page
  };

  /**
   * Refresh submissions and admin logs from localStorage
   * 
   * This function reloads all data to ensure the dashboard shows the most current information.
   */
  const refreshSubmissions = () => {
    const storedSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]'); // Get fresh submissions
    const adminLog = JSON.parse(localStorage.getItem('adminLog') || '[]'); // Get fresh admin logs
    console.log('Refreshed submissions:', storedSubmissions); // Debug log
    console.log('Refreshed admin log:', adminLog); // Debug log
    
    // Combine submissions with admin logs for comprehensive display
    const allEntries = [...storedSubmissions, ...adminLog];
    allEntries.sort((a, b) => b.time - a.time); // Sort by time, newest first
    
    // Add a flag to distinguish between submissions and admin logs
    const processedEntries = allEntries.map(entry => ({
      ...entry,
      isSubmission: !entry.action && (entry.content || entry.file) && entry.filename, // Use either content or file
      isAdminLog: !!entry.action
    }));
    
    console.log('Processed entries:', processedEntries);
    setSubmissions(processedEntries); // Update state with fresh data
  };

  /**
   * Add sample data for testing and demonstration purposes
   * 
   * This function creates example submissions to populate the dashboard
   * when no real data is available, useful for testing and demonstrations.
   */
  const addSampleData = () => {
    // Create a minimal valid PDF base64 content for testing
    const minimalPDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgMyAwIFIgXQ0KPj4NCmVuZG9iag0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDIgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDQgMCBSDQo+Pg0KPj4NCi9Db250ZW50cyA1IDAgUg0KL01lZGlhQm94IFsgMCAwIDYxMiA3OTIgXQ0KPj4NCmVuZG9iag0KNCAwIG9iag0KPDwNCi9UeXBlIC9Gb250DQovU3VidHlwZSAvVHlwZTENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQo+Pg0KZW5kb2JqDQo1IDAgb2JqDQo8PA0KL0xlbmd0aCAxNA0KPj4NCnN0cmVhbQ0KQlQNCjEwMCA3MDAgVEQKL0YxIDEyIFRqDQpIZWxsbyBXb3JsZCEgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KeHJlZg0KMCA2DQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
    
    // Test the base64 content first
    try {
      const testBinary = atob(minimalPDFBase64);
      console.log('Sample PDF base64 is valid, binary length:', testBinary.length);
    } catch (error) {
      console.error('Sample PDF base64 is invalid:', error);
    }
    
    const sampleSubmissions = [
      {
        time: Date.now() - 3600000, // 1 hour ago
        user: 'john.doe',
        stage: 'Stage1',
        filename: 'john_doe_Stage1.pdf',
        notes: 'Initial submission',
        content: minimalPDFBase64
      },
      {
        time: Date.now() - 7200000, // 2 hours ago
        user: 'jane.smith',
        stage: 'Stage2',
        filename: 'jane_smith_Stage2.pdf',
        notes: 'Reviewed by librarian',
        content: minimalPDFBase64
      },
      {
        time: Date.now() - 10800000, // 3 hours ago
        user: 'bob.wilson',
        stage: 'Stage3',
        filename: 'bob_wilson_Stage3.pdf',
        notes: 'Final approval pending',
        content: minimalPDFBase64
      }
    ];
    console.log('Adding sample data:', sampleSubmissions);
    localStorage.setItem('submissions', JSON.stringify(sampleSubmissions)); // Save to localStorage
    setSubmissions(sampleSubmissions); // Update state
    console.log('Sample data saved to localStorage');
  };

  /**
   * Download a PDF file from base64 content
   * 
   * This function converts base64 content back to a downloadable PDF file
   * and triggers the browser's download mechanism.
   * 
   * @param {string} filename - The name of the file to download
   * @param {string} content - Base64 encoded PDF content
   */
  const downloadFile = (filename, content) => {
    if (!filename || !content) {
      console.error('Missing file information:', { filename, content: !!content });
      window.alert('Missing file information. Cannot download.');
      return;
    }
    
    console.log('Download attempt:', { 
      filename, 
      contentType: typeof content,
      isFile: content instanceof File,
      contentLength: content instanceof File ? content.size : (typeof content === 'string' ? content.length : 'unknown'),
      contentPreview: content instanceof File ? 'File object' : (typeof content === 'string' ? content.substring(0, 50) : 'not a string')
    });
    
    try {
      // If it's a File object, use it directly
      if (content instanceof File) {
        console.log('Processing File object...');
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`Downloaded File object: ${filename}`);
        return;
      }
      
      // Handle base64 content
      console.log('Processing base64 content...');
      
      // Check if content is actually a string
      if (typeof content !== 'string') {
        console.error('Content is not a string, cannot process as base64');
        console.log('Content type:', typeof content);
        console.log('Is File object:', content instanceof File);
        console.log('Content keys:', content && typeof content === 'object' ? Object.keys(content) : 'not an object');
        
        // If it's a corrupted File object from localStorage (empty object), show helpful message
        if (content && typeof content === 'object' && Object.keys(content).length === 0) {
          console.error('Detected corrupted File object from localStorage');
          window.alert('File object was corrupted during storage. This submission needs to be re-uploaded.');
          return;
        }
        
        window.alert('Invalid content type. Expected string or File but got: ' + typeof content);
        return;
      }
      
      let pdfData = content;
      
      // If it's a data URL, extract the base64 part
      if (pdfData.startsWith('data:')) {
        console.log('Extracting base64 from data URL...');
        pdfData = pdfData.split(',')[1];
      }
      
      // Clean the base64 string
      pdfData = pdfData.replace(/\s+/g, '');
      
      console.log('Processed content length:', pdfData.length);
      console.log('Content preview:', pdfData.substring(0, 200));
      
      // Validate that we have valid base64 content
      if (!pdfData || pdfData.length < 10) {
        console.error('Content too short:', pdfData.length);
        window.alert(`Invalid file content. Content length: ${pdfData.length}. The file may be corrupted or empty.`);
        return;
      }
      
      // More lenient base64 validation
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(pdfData)) {
        console.error('Invalid base64 format. First 50 chars:', pdfData.substring(0, 50));
        console.error('Contains invalid chars:', pdfData.match(/[^A-Za-z0-9+/=]/g));
        window.alert('Invalid base64 format. The file content may be corrupted.');
        return;
      }
      
      // Decode base64 to binary
      console.log('Decoding base64 to binary...');
      const binary = atob(pdfData);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      console.log('Binary length:', bytes.length);
      console.log('First few bytes:', Array.from(bytes.slice(0, 10)));
      
      // Validate PDF header
      const pdfHeader = String.fromCharCode(...bytes.slice(0, 4));
      console.log('PDF header:', pdfHeader);
      if (pdfHeader !== '%PDF') {
        console.error('Invalid PDF header:', pdfHeader);
        window.alert('Invalid PDF header. The file may not be a valid PDF.');
        return;
      }
      
      // Create blob and download
      console.log('Creating blob and downloading...');
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Successfully downloaded: ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Filename:', filename);
      console.error('Content type:', typeof content);
      console.error('Is File:', content instanceof File);
      console.error('Content length:', typeof content === 'string' ? content.length : (content instanceof File ? content.size : 'unknown'));
      console.error('Content preview:', typeof content === 'string' ? content.substring(0, 100) : 'not a string');
      
      let errorMessage = 'Error downloading PDF. ';
      if (error.name === 'InvalidCharacterError') {
        errorMessage += 'The file contains invalid characters.';
      } else if (error.name === 'TypeError') {
        errorMessage += 'The file format is not supported.';
      } else {
        errorMessage += 'The file content may be corrupted or invalid.';
      }
      
      window.alert(errorMessage);
    }
  };

  const previewFile = (filename, content) => {
    if (!filename || !content) {
      console.error('Missing file information:', { filename, content: !!content });
      window.alert('Missing file information. Cannot preview.');
      return;
    }
    
    try {
      // If it's a File object, use it directly
      if (content instanceof File) {
        const url = URL.createObjectURL(content);
        window.open(url, '_blank');
        return;
      }
      
      // Handle base64 content
      if (typeof content !== 'string') {
        window.alert('Invalid content type. Expected string or File but got: ' + typeof content);
        return;
      }
      
      let pdfData = content;
      
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
    } catch (error) {
      console.error('Preview error:', error);
      window.alert('Error previewing PDF. Please try again.');
    }
  };

  /**
   * AdminDashboard Component - Comprehensive Styling Object
   * 
   * This object contains all the styling for the admin dashboard page.
   * Each style function takes theme parameters (dark/light mode) and returns
   * appropriate CSS properties for responsive, accessible design.
   */
  const styles = {
    // Full-screen background with theme support
    body: (dark, fontSize) => ({
      fontFamily: "'BentonSans Book', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      margin: 0,
      background: dark ? '#1e1e1e' : '#f1f1f1',
      color: dark ? '#fff' : '#201436',
      transition: 'background .3s,color .3s',
      fontSize,
      boxSizing: 'border-box',
    }),
    // Settings bar positioned in top-right corner
    settingsBar: {
      position: 'fixed',
      top: 15,
      right: 20,
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      zIndex: 1000,
    },
    // Font size selector dropdown styling
    select: dark => ({
      fontFamily: "'BentonSans Book'",
      borderRadius: 4,
      border: '1px solid #ccc',
      padding: '.4rem 1rem',
      background: dark ? '#2e2e2e' : '#fff',
      color: dark ? '#fff' : '#201436',
      fontSize: '1rem',
      outline: 'none',
      transition: 'background .3s,color .3s',
    }),
    // Button styling with hover effects
    button: (dark, hover) => ({
      padding: '.5rem 1rem',
      border: 'none',
      background: '#4F2683',
      color: '#fff',
      borderRadius: 4,
      fontFamily: "'BentonSans Book'",
      fontWeight: 600,
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background .3s',
      outline: 'none',
      opacity: hover ? 0.85 : 1,
    }),
    // Main container with proper spacing and layout
    container: dark => ({
      marginTop: 60,
      padding: '2rem',
      flex: 1,
      overflow: 'auto',
      background: 'none',
      borderRadius: 0,
      boxShadow: 'none',
      width: '100%',
      maxWidth: '100vw',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      boxSizing: 'border-box',
    }),
    // Main heading styling
    h1: dark => ({
      fontFamily: "'BentonSans Bold'",
      textAlign: 'center',
      color: dark ? '#fff' : '#201436',
      fontSize: '2rem',
      margin: 0,
      marginBottom: '1.5rem',
      letterSpacing: '-1px',
      transition: 'color .3s',
    }),
    // Table styling for data display
    table: dark => ({
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
      background: 'none',
    }),
    // Table header styling
    th: dark => ({
      background: dark ? '#2e2e2e' : '#eee',
      color: dark ? '#fff' : '#201436',
      border: dark ? '1px solid #555' : '1px solid #ccc',
      padding: '.5rem',
      textAlign: 'left',
      fontWeight: 600,
      fontFamily: "'BentonSans Book'",
    }),
    // Table cell styling with empty state support
    td: (dark, empty) => ({
      background: 'none',
      color: dark ? '#fff' : '#201436',
      border: dark ? '1px solid #555' : '1px solid #ccc',
      padding: '.5rem',
      textAlign: 'left',
      fontFamily: "'BentonSans Book'",
      opacity: empty ? 0.7 : 1,
    }),
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
      {/* Settings Bar */}
      <div style={styles.settingsBar}>
        <label htmlFor="darkModeToggle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input 
            id="darkModeToggle"
            name="darkMode"
            type="checkbox" 
            checked={dark} 
            onChange={e => setDark(e.target.checked)} 
          />
          <span style={{ marginLeft: 6 }}>{dark ? '🌙' : '☀'}</span>
        </label>
        <label htmlFor="fontSizeSelect" style={{ display: 'none' }}>Font Size</label>
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
        <button onClick={refreshSubmissions} style={styles.button(dark, false)}>🔄 Refresh</button>
        <button onClick={addSampleData} style={styles.button(dark, false)}>📊 Sample Data</button>
        <button onClick={() => {
          localStorage.removeItem('submissions');
          localStorage.removeItem('adminLog');
          refreshSubmissions();
        }} style={styles.button(dark, false)}>🗑️ Clear Data</button>
        <button onClick={() => {
          const storedSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
          const adminLog = JSON.parse(localStorage.getItem('adminLog') || '[]');
          console.log('=== DEBUG DATA ===');
          console.log('All submissions:', storedSubmissions);
          console.log('All admin logs:', adminLog);
          
          // Detailed analysis of each submission
          storedSubmissions.forEach((sub, index) => {
            console.log(`--- Submission ${index + 1} ---`);
            console.log('Filename:', sub.filename);
            console.log('Stage:', sub.stage);
            console.log('Has content:', !!sub.content);
            console.log('Has file:', !!sub.file);
            console.log('Content type:', typeof sub.content);
            console.log('Content length:', sub.content ? sub.content.length : 'N/A');
            console.log('Content preview:', sub.content ? sub.content.substring(0, 100) : 'N/A');
            if (sub.content) {
              try {
                const testBinary = atob(sub.content);
                console.log('Base64 decode successful, binary length:', testBinary.length);
              } catch (error) {
                console.log('Base64 decode failed:', error.message);
              }
            }
          });
          console.log('=== END DEBUG ===');
          window.alert(`Found ${storedSubmissions.length} submissions and ${adminLog.length} admin logs. Check console for detailed analysis.`);
        }} style={styles.button(dark, false)}>🔍 Debug Data</button>
        <button onClick={() => {
          // Test download with a known good PDF
          const testPDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgMyAwIFIgXQ0KPj4NCmVuZG9iag0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDIgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDQgMCBSDQo+Pg0KPj4NCi9Db250ZW50cyA1IDAgUg0KL01lZGlhQm94IFsgMCAwIDYxMiA3OTIgXQ0KPj4NCmVuZG9iag0KNCAwIG9iag0KPDwNCi9UeXBlIC9Gb250DQovU3VidHlwZSAvVHlwZTENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQo+Pg0KZW5kb2JqDQo1IDAgb2JqDQo8PA0KL0xlbmd0aCAxNA0KPj4NCnN0cmVhbQ0KQlQNCjEwMCA3MDAgVEQKL0YxIDEyIFRqDQpIZWxsbyBXb3JsZCEgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KeHJlZg0KMCA2DQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
          downloadFile('test_download.pdf', testPDFBase64);
        }} style={styles.button(dark, false)}>🧪 Test Download</button>
        <button onClick={handleLogout} style={styles.button(dark, false)}>Logout</button>
      </div>
      {/* Main Card */}
      <div style={styles.container(dark)}>
        <h1 style={styles.h1(dark)}>Administrator Dashboard</h1>
        <p style={{ 
          textAlign: 'center', 
          color: dark ? '#9ca3af' : '#6b7280', 
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          Download buttons are only available for documents that have been approved and published by the final reviewer
        </p>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={styles.table(dark)}>
            <thead>
              <tr>
                <th style={styles.th(dark)}>Time</th>
                <th style={styles.th(dark)}>User</th>
                <th style={styles.th(dark)}>Stage</th>
                <th style={styles.th(dark)}>Progress</th>
                <th style={styles.th(dark)}>Filename</th>
                <th style={styles.th(dark)}>Notes</th>
                <th style={styles.th(dark)}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr><td colSpan={7} style={styles.td(dark, true)}>No submissions yet.</td></tr>
              ) : (
                submissions.map((s, i) => {
                  // Calculate progress percentage based on stage
                  const stages = ['Stage0', 'Stage1', 'Stage2', 'Stage3'];
                  const stageIndex = stages.indexOf(s.stage || 'Stage0');
                  const progressPercentage = ((stageIndex + 1) / stages.length) * 100;
                  
                  // Get status for badge
                  const getStatus = () => {
                    if (s.action === 'sent_back') return 'Returned';
                    if (s.stage === 'Stage3') return 'Approved';
                    if (s.stage === 'Stage2') return 'In Review';
                    if (s.stage === 'Stage1') return 'In Review';
                    return 'Pending';
                  };
                  
                  const status = getStatus();
                  
                  return (
                    <tr key={i}>
                      <td style={styles.td(dark)}>{new Date(s.time).toLocaleString()}</td>
                      <td style={styles.td(dark)}>{s.user}</td>
                      <td style={styles.td(dark)}>
                        {s.action === 'sent_back' ? (
                          <span style={{ color: '#dc2626', fontWeight: 600 }}>SENT BACK</span>
                        ) : (
                          s.stage
                        )}
                      </td>
                      <td style={styles.td(dark)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '60px',
                            height: '8px',
                            backgroundColor: dark ? '#374151' : '#e5e7eb',
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${progressPercentage}%`,
                              background: 'linear-gradient(90deg, #4F2683 0%, #7c3aed 50%, #a855f7 100%)',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: dark ? '#9ca3af' : '#6b7280',
                            minWidth: '30px',
                          }}>
                            {Math.round(progressPercentage)}%
                          </span>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            ...(status === 'Pending' ? {
                              background: dark ? '#3b82f6' : '#dbeafe',
                              color: dark ? '#bfdbfe' : '#1e40af',
                            } : status === 'In Review' ? {
                              background: dark ? '#f59e0b' : '#fef3c7',
                              color: dark ? '#fde68a' : '#92400e',
                            } : status === 'Approved' ? {
                              background: dark ? '#10b981' : '#d1fae5',
                              color: dark ? '#a7f3d0' : '#065f46',
                            } : {
                              background: dark ? '#ef4444' : '#fee2e2',
                              color: dark ? '#fca5a5' : '#991b1b',
                            })
                          }}>
                            {status}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td(dark)}>{s.filename}</td>
                      <td style={styles.td(dark)}>{s.notes || ''}</td>
                      <td style={styles.td(dark)}>
                        {s.isSubmission && (s.content || s.file) && s.filename && s.stage === 'Stage3' ? (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => {
                                const downloadContent = s.content || s.file;
                                downloadFile(s.filename, downloadContent);
                              }}
                              style={{
                                ...styles.button(dark, false),
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                margin: '0',
                              }}
                              title="Download Published PDF"
                            >
                              📥 Download
                            </button>
                            <button
                              onClick={() => {
                                const previewContent = s.content || s.file;
                                previewFile(s.filename, previewContent);
                              }}
                              style={{
                                ...styles.button(dark, false),
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                margin: '0',
                                background: '#007bff',
                              }}
                              title="Preview Published PDF"
                            >
                              👁️ Preview
                            </button>
                          </div>
                        ) : s.isSubmission && (s.content || s.file) && s.filename ? (
                          <span style={{ 
                            color: dark ? '#9ca3af' : '#6b7280', 
                            fontSize: '0.75rem',
                            fontStyle: 'italic'
                          }}>
                            Pending approval
                          </span>
                        ) : (
                          <span style={{ color: dark ? '#9ca3af' : '#6b7280', fontSize: '0.75rem' }}>
                            {s.isAdminLog ? 'Log entry' : 'No file'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}