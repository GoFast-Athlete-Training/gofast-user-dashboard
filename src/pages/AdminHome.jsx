import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const AdminHome = () => {
  const navigate = useNavigate();

  // GLOBAL HYDRATION - Load data once for entire dashboard
  useEffect(() => {
    const hydrateDashboard = async () => {
      console.log('🚀 GLOBAL HYDRATION: Loading dashboard data...');
      
      try {
        // Call our working hydration endpoint
        const response = await fetch('https://gofastbackendv2-fall2025.onrender.com/api/athlete/admin/hydrate', {
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
        
        if (data.success && data.athletes) {
          // STORE FULL OBJECTS IN localStorage FOR ENTIRE DASHBOARD
          localStorage.setItem('athletesData', JSON.stringify(data.athletes));
          localStorage.setItem('athletesCount', data.count.toString());
          localStorage.setItem('athletesLastUpdated', new Date().toISOString());
          localStorage.setItem('athletesStatus', 'loaded');
          localStorage.setItem('dashboardHydrated', 'true');
          
          console.log('💾 GLOBAL HYDRATION: Stored', data.athletes.length, 'athletes in localStorage');
          console.log('🎯 GLOBAL HYDRATION: Dashboard ready for all components!');
          
          toast.success(`Dashboard hydrated with ${data.athletes.length} athletes!`);
        } else {
          throw new Error(data.message || 'Invalid response format');
        }
      } catch (err) {
        console.error('❌ GLOBAL HYDRATION: Error:', err);
        toast.error('Failed to hydrate dashboard: ' + err.message);
        
        // Set fallback status
        localStorage.setItem('dashboardHydrated', 'false');
        localStorage.setItem('athletesStatus', 'error');
      }
    };

    // Only hydrate if not already done recently
    const lastHydrated = localStorage.getItem('athletesLastUpdated');
    const dashboardHydrated = localStorage.getItem('dashboardHydrated');
    
    if (!dashboardHydrated || !lastHydrated) {
      hydrateDashboard();
    } else {
      // Check if data is stale (older than 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const lastUpdate = new Date(lastHydrated);
      
      if (lastUpdate < tenMinutesAgo) {
        console.log('🔄 GLOBAL HYDRATION: Data is stale, refreshing...');
        hydrateDashboard();
      } else {
        console.log('✅ GLOBAL HYDRATION: Using fresh cached data');
      }
    }
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
