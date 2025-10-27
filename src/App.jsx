import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import AdminHome from './pages/AdminHome';
import AdminDashboardChoices from './pages/AdminDashboardChoices';
import AdminAthletes from './pages/AdminAthletes';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboardChoices /></ProtectedRoute>} />
          <Route path="/athlete-admin" element={<ProtectedRoute><AdminAthletes /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;