import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users2, RefreshCw, Trash2, Eye, Calendar, Shield, MessageSquare, Activity, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

const AdminRunCrews = () => {
  const navigate = useNavigate();
  const [runCrews, setRunCrews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load runCrews from localStorage (NO API CALL)
  const loadRunCrewsFromLocalStorage = () => {
    console.log('📦 Loading runCrews from localStorage (NO API CALL)...');
    
    try {
      const storedRunCrews = localStorage.getItem('runCrewsData');
      
      if (storedRunCrews) {
        const runCrews = JSON.parse(storedRunCrews);
        console.log('✅ Loaded', runCrews.length, 'runCrews from localStorage');
        setRunCrews(runCrews);
        return runCrews;
      } else {
        console.warn('⚠️ No runCrews in localStorage - dashboard may need hydration');
        setRunCrews([]);
        toast.error('No RunCrew data available. Please refresh the dashboard.');
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading runCrews from localStorage:', error);
      toast.error('Failed to load runCrews from cache');
      setRunCrews([]);
      return [];
    }
  };

  // Refresh runCrews (ONLY called when user explicitly clicks refresh)
  const refreshRunCrews = async () => {
    setLoading(true);
    
    console.log('🔄 REFRESH: Loading runCrews from API...');
    
    try {
      // Use universal hydration route
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
      console.log('✅ REFRESH: Response received:', data);
      
      if (data.success && data.runCrews) {
        // Update localStorage
        localStorage.setItem('runCrewsData', JSON.stringify(data.runCrews));
        localStorage.setItem('runCrewsCount', data.count?.runCrews?.toString() || data.runCrews.length.toString());
        localStorage.setItem('runCrewsLastUpdated', new Date().toISOString());
        
        if (data.athletes) {
          localStorage.setItem('athletesData', JSON.stringify(data.athletes));
          localStorage.setItem('athletesCount', data.count?.athletes?.toString() || data.athletes.length.toString());
          localStorage.setItem('athletesLastUpdated', new Date().toISOString());
        }
        
        console.log('💾 REFRESH: Updated localStorage with', data.runCrews.length, 'runCrews');
        
        setRunCrews(data.runCrews);
        toast.success(`Refreshed: ${data.runCrews.length} runCrews loaded`);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('❌ REFRESH: Error loading runCrews:', err);
      toast.error('Failed to refresh runCrews: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMemberCount = (runCrew) => {
    if (runCrew.memberships && Array.isArray(runCrew.memberships)) {
      return runCrew.memberships.length;
    }
    return 0;
  };

  const getAdminName = (runCrew) => {
    if (runCrew.admin) {
      if (runCrew.admin.firstName && runCrew.admin.lastName) {
        return `${runCrew.admin.firstName} ${runCrew.admin.lastName}`;
      }
      return runCrew.admin.email || 'Unknown';
    }
    return 'No Admin';
  };

  useEffect(() => {
    // Use globally hydrated data from AdminHome
    const storedRunCrews = localStorage.getItem('runCrewsData');
    const dashboardHydrated = localStorage.getItem('dashboardHydrated');
    
    if (storedRunCrews && dashboardHydrated === 'true') {
      try {
        const runCrews = JSON.parse(storedRunCrews);
        setRunCrews(runCrews);
        console.log('📦 AdminRunCrews: Using globally hydrated data:', runCrews.length, 'runCrews');
        toast.success(`Loaded ${runCrews.length} runCrews from global cache`);
      } catch (error) {
        console.error('❌ AdminRunCrews: Error parsing localStorage data:', error);
        toast.error('Failed to load cached runCrew data');
      }
    } else {
      console.log('⚠️ AdminRunCrews: No data in localStorage - dashboard needs hydration');
      loadRunCrewsFromLocalStorage(); // Will show empty state - user should refresh dashboard
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-6">
        <Toaster position="top-right" />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-6 w-6" />
                GoFast RunCrews
              </CardTitle>
              <CardDescription>
                Manage RunCrews, view members, and oversee crew activities
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={refreshRunCrews} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh RunCrews
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-2">Loading GoFast runCrews...</span>
            </div>
          ) : runCrews.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No GoFast runCrews found.
            </div>
          ) : (
            <>
              {/* Metrics Dashboard */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">RunCrew Metrics</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{runCrews.length}</div>
                    <div className="text-xs text-gray-600">Total RunCrews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {runCrews.reduce((sum, rc) => sum + getMemberCount(rc), 0)}
                    </div>
                    <div className="text-xs text-gray-600">Total Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {runCrews.filter(rc => rc.messages && rc.messages.length > 0).length}
                    </div>
                    <div className="text-xs text-gray-600">Active Chats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {runCrews.filter(rc => rc.runs && rc.runs.length > 0).length}
                    </div>
                    <div className="text-xs text-gray-600">With Runs</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {runCrews.map((runCrew) => {
                  const memberCount = getMemberCount(runCrew);
                  const adminName = getAdminName(runCrew);
                  const runCrewId = runCrew.id;
                  
                  return (
                    <div key={runCrew.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                              <Users2 className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {runCrew.name || 'Unnamed RunCrew'}
                            </div>
                            <div className="text-sm text-gray-600">{runCrew.description || 'No description'}</div>
                            <div className="text-sm text-gray-500 space-y-1 mt-2">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  <strong>ID:</strong> {runCrewId || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <strong>Admin:</strong> {adminName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users2 className="h-3 w-3" />
                                  <strong>Members:</strong> {memberCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <strong>Created:</strong> {formatDate(runCrew.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {runCrew.messages && runCrew.messages.length > 0 && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {runCrew.messages.length} Messages
                                  </span>
                                )}
                                {runCrew.runs && runCrew.runs.length > 0 && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {runCrew.runs.length} Runs
                                  </span>
                                )}
                                {runCrew.events && runCrew.events.length > 0 && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {runCrew.events.length} Events
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/runcrew/${runCrewId}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default AdminRunCrews;

