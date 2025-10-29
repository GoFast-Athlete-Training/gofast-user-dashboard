import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import AdminHome from './pages/AdminHome';
import DashboardNavOptions from './pages/DashboardNavOptions';
import AdminAthletes from './pages/AdminAthletes';
import AthleteDetails from './pages/AthleteDetails';
import AthleteActivities from './pages/AthleteActivities';
import GarminConnectSuccess from './pages/GarminConnectSuccess';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/admin" element={<DashboardNavOptions />} />
        <Route path="/athlete-admin" element={<AdminAthletes />} />
        <Route path="/athlete/:athleteId" element={<AthleteDetails />} />
        <Route path="/athlete/:athleteId/activities" element={<AthleteActivities />} />
        <Route path="/garmin/success" element={<GarminConnectSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;