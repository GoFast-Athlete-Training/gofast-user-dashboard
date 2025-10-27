import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import AdminHome from './pages/AdminHome';
import AdminDashboardChoices from './pages/AdminDashboardChoices';
import AdminAthletes from './pages/AdminAthletes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/admin" element={<AdminDashboardChoices />} />
        <Route path="/athlete-admin" element={<AdminAthletes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;