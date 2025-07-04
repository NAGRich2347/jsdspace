import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import StudentSubmit from './components/StudentSubmit';
import LibrarianReview from './components/LibrarianReview';
import ManualControls from './components/ManualControls';
import AdminDashboard from './components/AdminDashboard';
import FinalApproval from './components/FinalApproval';
import UploadForm from './components/UploadForm';
import MetadataForm from './components/MetadataForm';
import Review from './components/Review';
import Publish from './components/Publish';

export default function App() {
  return (
    <BrowserRouter>
      <header className="bg-blue-600 text-white p-4 text-xl">DSpace Workflow</header>
      <div className="p-6">
        <Routes>
          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          {/* Student flow */}
          <Route path="/submit" element={<StudentSubmit />} />
          <Route path="/upload" element={<UploadForm />} />
          <Route path="/metadata" element={<MetadataForm />} />
          {/* Review & publish */}
          <Route path="/review" element={<LibrarianReview />} />
          <Route path="/review/:id" element={<Review />} />
          <Route path="/publish/:id" element={<Publish />} />
          {/* Admin */}
          <Route path="/controls" element={<ManualControls />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/final-approval" element={<FinalApproval />} />
          {/* Default */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}