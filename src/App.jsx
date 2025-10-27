import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import AdminHome from './pages/AdminHome';
import DashboardNavOptions from './pages/DashboardNavOptions';
import AdminAthletes from './pages/AdminAthletes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/admin" element={<DashboardNavOptions />} />
        <Route path="/athlete-admin" element={<AdminAthletes />} />
      </Routes>
    </Router>
  );
}

export default App;