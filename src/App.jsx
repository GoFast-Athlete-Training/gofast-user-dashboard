import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import AdminHome from './pages/AdminHome';
import DashboardNavOptions from './pages/DashboardNavOptions';
import AdminAthletes from './pages/AdminAthletes';
import AthleteDetails from './pages/AthleteDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/admin" element={<DashboardNavOptions />} />
        <Route path="/athlete-admin" element={<AdminAthletes />} />
        <Route path="/athlete/:athleteId" element={<AthleteDetails />} />
      </Routes>
    </Router>
  );
}

export default App;