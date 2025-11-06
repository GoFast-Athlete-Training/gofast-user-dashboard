import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, LogOut, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleRefreshUsers = async () => {
    setRefreshing(true);
    toast.loading('Refreshing users...', { id: 'refresh-users' });
    
    try {
      // Clear existing cache
      localStorage.removeItem('athletesData');
      localStorage.removeItem('athletesCount');
      localStorage.removeItem('athletesLastUpdated');
      localStorage.removeItem('dashboardHydrated');
      
      // Re-hydrate from API
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
      
      if (data.success && data.athletes) {
        localStorage.setItem('athletesData', JSON.stringify(data.athletes));
        localStorage.setItem('athletesCount', data.count.toString());
        localStorage.setItem('athletesLastUpdated', new Date().toISOString());
        localStorage.setItem('dashboardHydrated', 'true');
        
        toast.success(`Refreshed ${data.athletes.length} athletes!`, { id: 'refresh-users' });
        
        // Reload the page to update all components
        window.location.reload();
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('❌ Error refreshing users:', err);
      toast.error('Failed to refresh users: ' + err.message, { id: 'refresh-users' });
    } finally {
      setRefreshing(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo/Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="GoFast" className="w-8 h-8 rounded-full" />
              <span className="text-xl font-bold text-gray-900">GoFast Admin</span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-2">
            <Button
              variant={isActive('/admin') ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            
            <Button
              variant={isActive('/athlete-admin') ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate('/athlete-admin')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Athletes
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshUsers}
              disabled={refreshing}
              className="flex items-center gap-2"
              title="Refresh user data from backend"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Users
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

