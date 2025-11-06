import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const AdminHome = () => {
  const navigate = useNavigate();

  // GLOBAL HYDRATION - Load data once for entire dashboard (ONLY if localStorage is empty)
  useEffect(() => {
    const hydrateDashboard = async () => {
      console.log('🚀 GLOBAL HYDRATION: Loading dashboard data...');
      
      try {
        // Use universal hydration route - get athletes AND runCrews in one call
        const response = await fetch('https://gofastbackendv2-fall2025.onrender.com/api/admin/hydrate?entity=athletes,runcrews', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ GLOBAL HYDRATION: Response received:', data);
        
        if (data.success) {
          // STORE ALL ENTITIES IN localStorage FOR ENTIRE DASHBOARD
          if (data.athletes) {
            localStorage.setItem('athletesData', JSON.stringify(data.athletes));
            localStorage.setItem('athletesCount', data.count?.athletes?.toString() || data.athletes.length.toString());
            console.log('💾 GLOBAL HYDRATION: Stored', data.athletes.length, 'athletes in localStorage');
          }
          
          if (data.runCrews) {
            localStorage.setItem('runCrewsData', JSON.stringify(data.runCrews));
            localStorage.setItem('runCrewsCount', data.count?.runCrews?.toString() || data.runCrews.length.toString());
            console.log('💾 GLOBAL HYDRATION: Stored', data.runCrews.length, 'runCrews in localStorage');
          }
          
          localStorage.setItem('athletesLastUpdated', new Date().toISOString());
          localStorage.setItem('runCrewsLastUpdated', new Date().toISOString());
          localStorage.setItem('dashboardHydrated', 'true');
          
          console.log('🎯 GLOBAL HYDRATION: Dashboard ready for all components!');
          
          const athleteCount = data.athletes?.length || 0;
          const runCrewCount = data.runCrews?.length || 0;
          toast.success(`Dashboard hydrated: ${athleteCount} athletes, ${runCrewCount} runCrews!`);
        } else {
          throw new Error(data.message || 'Invalid response format');
        }
      } catch (err) {
        console.error('❌ GLOBAL HYDRATION: Error:', err);
        toast.error('Failed to hydrate dashboard: ' + err.message);
        
        // Set fallback status
        localStorage.setItem('dashboardHydrated', 'false');
      }
    };

    // Check if already hydrated - if yes, NO API CALL
    const dashboardHydrated = localStorage.getItem('dashboardHydrated');
    const athletesData = localStorage.getItem('athletesData');
    const runCrewsData = localStorage.getItem('runCrewsData');
    
    if (dashboardHydrated === 'true' && athletesData && runCrewsData) {
      console.log('✅ GLOBAL HYDRATION: Already hydrated - using localStorage (NO API CALL)');
      return; // NO API CALL - data already in localStorage
    }
    
    // Only hydrate if localStorage is empty
    console.log('🔄 GLOBAL HYDRATION: localStorage empty - calling API');
    hydrateDashboard();
  }, []);

  const handleEnterAdmin = () => {
    toast.success('Welcome to GoFast Admin!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Toaster position="top-right" />
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <img src="/logo.jpg" alt="GoFast" className="w-12 h-12 rounded-full" />
          </div>
          <CardTitle className="text-2xl">Welcome to GoFast Admin Portal</CardTitle>
          <CardDescription className="text-base">
            Manage athletes, track progress, and oversee the GoFast community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleEnterAdmin}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
          >
            🚀 Enter Admin Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;
