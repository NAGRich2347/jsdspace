// --- UploadForm.js ---
// React component for secure file upload functionality.
// Handles PDF, Word documents, and text files with validation and error handling.
// Provides user feedback and loading states during upload process.

import React, { useState } from 'react';
import api from '../services/api';

// Allowed file types for upload (MIME types)
const ALLOWED_TYPES = [
  'application/pdf', // PDF files
  'application/msword', // DOC files
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
  'text/plain' // TXT files
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB maximum file size

/**
 * UploadForm Component
 * 
 * This component provides a secure file upload interface for the workflow system.
 * It validates file types and sizes before uploading to ensure system security
 * and performance.
 * 
 * Features:
 * - File type validation (PDF, DOC, DOCX, TXT)
 * - File size validation (max 10MB)
 * - Real-time error feedback
 * - Loading states during upload
 * - Success confirmation
 * - Form reset after successful upload
 * 
 * Security:
 * - MIME type validation
 * - File size limits
 * - Secure API communication
 */
export default function UploadForm() {
  // Form state management
  const [file, setFile] = useState(null); // Selected file for upload
  const [error, setError] = useState(''); // Error message display
  const [success, setSuccess] = useState(''); // Success message display
  const [loading, setLoading] = useState(false); // Loading state during upload

  /**
   * Handle file selection and validate type/size
   * 
   * This function validates the selected file against allowed types and size limits
   * before setting it for upload. It provides immediate feedback to the user.
   * 
   * @param {Event} e - The file input change event
   */
  const handleFileChange = (e) => {
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
    const selected = e.target.files[0]; // Get the selected file
    
    if (!selected) return; // No file selected
    
    // Validate file type against allowed MIME types
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Only PDF, Word, and TXT files are allowed.');
      return;
    }
    
    // Validate file size against maximum limit
    if (selected.size > MAX_SIZE) {
      setError('File size must be 10MB or less.');
      return;
    }
    
    setFile(selected); // Set valid file for upload
  };

  /**
   * Handle form submission and upload file to backend
   * 
   * This function creates a FormData object and sends the file to the backend API.
   * It handles loading states and provides user feedback throughout the process.
   * 
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
    
    if (!file) {
      setError('Please select a file to upload.'); // Validate file is selected
      return;
    }
    
    setLoading(true); // Start loading state
    
    try {
      const formData = new FormData(); // Create FormData for file upload
      formData.append('file', file); // Add file to form data
      formData.append('filename', file.name); // Add filename to form data
      
      // Send file to backend API endpoint
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' } // Set correct content type for file upload
      });
      
      setSuccess('File uploaded successfully!'); // Show success message
      setFile(null); // Reset file selection
    } catch (err) {
      setError('Upload failed. Please try again.'); // Show error message on failure
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Upload Document</h2>
      <form onSubmit={handleSubmit}>
        {/* File input with accepted file types */}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt" // Browser-level file type filtering
          onChange={handleFileChange}
          className="mb-2 block w-full"
        />
        
        {/* Error message display */}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        
        {/* Success message display */}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        
        {/* Submit button with loading state */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading} // Disable button during upload
        >
          {loading ? 'Uploading...' : 'Upload'} {/* Show loading text or upload text */}
        </button>
      </form>
    </div>
  );
} 