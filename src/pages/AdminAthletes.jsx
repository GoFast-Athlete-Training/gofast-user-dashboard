import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, RefreshCw, Trash2, Edit, Mail, Calendar, Shield, MessageSquare, CheckSquare, Square, Settings, Flag, Key, Activity, Save, X, Eye, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import Navbar from '../components/Navbar';
import AdminUpsertWizard from '../components/AdminUpsertWizard.jsx';
import toast, { Toaster } from 'react-hot-toast';

const AdminAthletes = () => {
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState(null);
  const [upsertWizardOpen, setUpsertWizardOpen] = useState(false);
  const [selectedAthleteForUpsert, setSelectedAthleteForUpsert] = useState(null);
  // Removed inline editing - editing happens on detail page now

  // Mock athlete data removed - only show real data from backend

  // Load athletes from localStorage (NO API CALL)
  const loadAthletesFromLocalStorage = () => {
    console.log('📦 Loading athletes from localStorage (NO API CALL)...');
    
    try {
      const storedAthletes = localStorage.getItem('athletesData');
      
      if (storedAthletes) {
        const athletes = JSON.parse(storedAthletes);
        console.log('✅ Loaded', athletes.length, 'athletes from localStorage');
        setAthletes(athletes);
        return athletes;
      } else {
        console.warn('⚠️ No athletes in localStorage - dashboard may need hydration');
        setAthletes([]);
        toast.error('No athlete data available. Please refresh the dashboard.');
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading athletes from localStorage:', error);
      toast.error('Failed to load athletes from cache');
      setAthletes([]);
      return [];
    }
  };

  // Refresh athletes (ONLY called when user explicitly clicks refresh)
  const refreshAthletes = async () => {
    setLoading(true);
    
    console.log('🔄 REFRESH: Loading athletes from API...');
    
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
      
      if (data.success && data.athletes) {
        // Update localStorage
        localStorage.setItem('athletesData', JSON.stringify(data.athletes));
        localStorage.setItem('athletesCount', data.count?.athletes?.toString() || data.athletes.length.toString());
        localStorage.setItem('athletesLastUpdated', new Date().toISOString());
        
        if (data.runCrews) {
          localStorage.setItem('runCrewsData', JSON.stringify(data.runCrews));
          localStorage.setItem('runCrewsCount', data.count?.runCrews?.toString() || data.runCrews.length.toString());
          localStorage.setItem('runCrewsLastUpdated', new Date().toISOString());
        }
        
        console.log('💾 REFRESH: Updated localStorage with', data.athletes.length, 'athletes');
        
        setAthletes(data.athletes);
        toast.success(`Refreshed: ${data.athletes.length} athletes loaded`);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('❌ REFRESH: Error loading athletes:', err);
      toast.error('Failed to refresh athletes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAthlete = async (athlete) => {
    console.log('🗑️ Attempting to delete athlete:', athlete);
    
    setAthleteToDelete(athlete);
    
    if (!window.confirm(`Are you sure you want to delete ${athlete.firstName || athlete.email}?`)) {
      setAthleteToDelete(null);
      return;
    }

    try {
      const athleteId = athlete.athleteId || athlete.id;
      console.log('🗑️ Sending DELETE request for athlete:', athleteId);
      
      const response = await fetch(`https://gofastbackendv2-fall2025.onrender.com/api/athlete/${athleteId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      console.log('🗑️ Response status:', response.status);
      
      if (response.ok) {
        // Remove from local state on successful deletion
        setAthletes(prevAthletes => prevAthletes.filter(a => (a.athleteId || a.id) !== athleteId));
        setSelectedAthletes(prevSelected => {
          const newSelected = new Set(prevSelected);
          newSelected.delete(athleteId);
          return newSelected;
        });
        
        // Update localStorage cache
        const storedAthletes = JSON.parse(localStorage.getItem('athletesData') || '[]');
        const updatedAthletes = storedAthletes.filter(a => (a.athleteId || a.id) !== athleteId);
        localStorage.setItem('athletesData', JSON.stringify(updatedAthletes));
        
        toast.success(`Athlete ${athlete.firstName || athlete.email} deleted successfully`);
        console.log('🗑️ Athlete removed from frontend state and cache');
      } else if (response.status === 404) {
        // Athlete already deleted from database, remove from UI
        setAthletes(prevAthletes => prevAthletes.filter(a => (a.athleteId || a.id) !== athleteId));
        setSelectedAthletes(prevSelected => {
          const newSelected = new Set(prevSelected);
          newSelected.delete(athleteId);
          return newSelected;
        });
        toast.success('Athlete already deleted from database');
        console.log('🗑️ Athlete was already deleted from database');
      } else {
        const errorText = await response.text();
        console.error('🗑️ Delete failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('🗑️ Delete error:', err);
      toast.error('Failed to delete athlete: ' + err.message);
    } finally {
      setAthleteToDelete(null);
    }
  };

  // Edit functionality moved to detail page (AthleteDetails.jsx)
  // Users click "Edit" button → navigate to detail page → edit there

  // Checkbox handlers
  const handleSelectAthlete = (athleteId) => {
    const newSelected = new Set(selectedAthletes);
    if (newSelected.has(athleteId)) {
      newSelected.delete(athleteId);
    } else {
      newSelected.add(athleteId);
    }
    setSelectedAthletes(newSelected);
    setSelectAll(newSelected.size === athletes.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAthletes(new Set());
      setSelectAll(false);
    } else {
      const allAthleteIds = athletes.map(athlete => athlete.athleteId || athlete.id);
      setSelectedAthletes(new Set(allAthleteIds));
      setSelectAll(true);
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

  const getAthleteStatus = (athlete) => {
    const status = athlete.status || 'active';
    
    switch (status) {
      case 'active':
        return { 
          label: 'Active', 
          color: 'bg-green-100 text-green-800', 
          safeToDelete: false,
          reason: 'Active athlete - do not delete'
        };
      
      case 'inactive':
        return { 
          label: 'Inactive', 
          color: 'bg-orange-100 text-orange-800', 
          safeToDelete: true,
          reason: 'Inactive athlete - safe to delete after 30 days'
        };
      
      case 'suspended':
        return { 
          label: 'Suspended', 
          color: 'bg-red-100 text-red-800', 
          safeToDelete: false,
          reason: 'Suspended athlete - review before deletion'
        };
      
      default:
        return { 
          label: 'Unknown', 
          color: 'bg-gray-100 text-gray-800', 
          safeToDelete: false,
          reason: 'Unknown status - do not delete'
        };
    }
  };

  const getProfileCompleteness = (athlete) => {
    const requiredFields = ['firstName', 'lastName', 'gofastHandle', 'birthday', 'gender', 'city', 'state', 'primarySport'];
    const completedFields = requiredFields.filter(field => athlete[field] && athlete[field].toString().trim() !== '');
    const completeness = (completedFields.length / requiredFields.length) * 100;
    
    if (completeness >= 80) {
      return { label: 'Complete', color: 'bg-green-100 text-green-800' };
    } else if (completeness >= 50) {
      return { label: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Incomplete', color: 'bg-red-100 text-red-800' };
    }
  };

  useEffect(() => {
    // Use globally hydrated data from AdminHome
    const storedAthletes = localStorage.getItem('athletesData');
    const dashboardHydrated = localStorage.getItem('dashboardHydrated');
    
    if (storedAthletes && dashboardHydrated === 'true') {
      try {
        const athletes = JSON.parse(storedAthletes);
        setAthletes(athletes);
        console.log('📦 AdminAthletes: Using globally hydrated data:', athletes.length, 'athletes');
        toast.success(`Loaded ${athletes.length} athletes from global cache`);
      } catch (error) {
        console.error('❌ AdminAthletes: Error parsing localStorage data:', error);
        toast.error('Failed to load cached athlete data');
      }
    } else {
      console.log('⚠️ AdminAthletes: No data in localStorage - dashboard needs hydration');
      loadAthletesFromLocalStorage(); // Will show empty state - user should refresh dashboard
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
                <Users className="h-6 w-6" />
                GoFast Athletes
              </CardTitle>
              <CardDescription>
                Manage athlete accounts, view profiles, and handle athlete data
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={refreshAthletes} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Athletes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-2">Loading GoFast athletes...</span>
            </div>
          ) : athletes.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No GoFast athletes found.
            </div>
          ) : (
            <>
              {/* Cool Metrics Dashboard */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">GoFast Metrics</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{athletes.length}</div>
                    <div className="text-xs text-gray-600">Total Athletes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{athletes.filter(a => a.firstName && a.lastName).length}</div>
                    <div className="text-xs text-gray-600">Complete Profiles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{athletes.filter(a => a.primarySport).length}</div>
                    <div className="text-xs text-gray-600">With Sport</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{athletes.filter(a => a.city).length}</div>
                    <div className="text-xs text-gray-600">With Location</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Select All Header */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded"
                  >
                    {selectAll ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">
                      {selectAll ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>
                  {selectedAthletes.size > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedAthletes.size} of {athletes.length} selected
                    </span>
                  )}
                </div>

                {athletes.map((athlete) => {
                  const athleteStatus = getAthleteStatus(athlete);
                  const profileCompleteness = getProfileCompleteness(athlete);
                  const athleteId = athlete.athleteId || athlete.id;
                  const isSelected = selectedAthletes.has(athleteId);
                  
                  return (
                    <div key={athlete.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                      isSelected ? 'ring-2 ring-orange-500' : ''
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleSelectAthlete(athleteId)}
                            className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded"
                            title="Select for deletion"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-5 w-5 text-orange-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                              <Activity className="h-5 w-5 text-orange-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              <button 
                                onClick={() => navigate(`/athlete/${athleteId}`)}
                                className="hover:text-orange-600 hover:underline"
                              >
                                {athlete.firstName && athlete.lastName ? `${athlete.firstName} ${athlete.lastName}` : 'No Name Set'}
                              </button>
                            </div>
                            <div className="text-sm text-gray-600">{athlete.email}</div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  <strong>Athlete ID:</strong> {athlete.athleteId || athlete.id || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Key className="h-3 w-3" />
                                  <strong>Firebase:</strong> {athlete.firebaseId ? athlete.firebaseId.substring(0, 12) + '...' : 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <strong>Created:</strong> {formatDate(athlete.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${athleteStatus.color}`}>
                                  {athleteStatus.label}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${profileCompleteness.color}`}>
                                  {profileCompleteness.label}
                                </span>
                                {athlete.gofastHandle && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    @{athlete.gofastHandle}
                                  </span>
                                )}
                                {athlete.primarySport && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {athlete.primarySport}
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
                          onClick={() => navigate(`/athlete/${athleteId}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/athlete/${athleteId}/activities`)}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          Activities
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAthleteForUpsert(athlete);
                            setUpsertWizardOpen(true);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to New Model
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAthlete(athlete)}
                          title="Delete athlete"
                          disabled={athleteToDelete?.athleteId === athleteId}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {athleteToDelete?.athleteId === athleteId ? 'Deleting...' : 'Delete'}
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

      {/* Upsert Wizard Modal */}
      <AdminUpsertWizard
        isOpen={upsertWizardOpen}
        onClose={() => {
          setUpsertWizardOpen(false);
          setSelectedAthleteForUpsert(null);
        }}
        athlete={selectedAthleteForUpsert}
      />
    </div>
    </div>
  );
};

export default AdminAthletes;
