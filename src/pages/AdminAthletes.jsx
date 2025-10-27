import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Trash2, Edit, Mail, Calendar, Shield, MessageSquare, CheckSquare, Square, Settings, Flag, Key, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AdminAthletes = () => {
  const { isAdmin } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState(null);

  // Mock athlete data for testing - replace with real API call
  const mockAthletes = [
    {
      id: 'athlete_adam_cole_001',
      firebaseId: 'firebase_adam_cole_001',
      email: 'adam@example.com',
      firstName: 'Adam',
      lastName: 'Cole',
      gofastHandle: 'adam_cole',
      birthday: '1990-01-15',
      gender: 'male',
      city: 'Charlotte',
      state: 'NC',
      primarySport: 'running',
      bio: 'Passionate runner focused on marathon training and community building.',
      instagram: '@adamcole_runs',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z',
      status: 'active'
    },
    {
      id: 'athlete_sarah_johnson_002',
      firebaseId: 'firebase_sarah_johnson_002',
      email: 'sarah@example.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      gofastHandle: 'sarah_runs',
      birthday: '1992-05-20',
      gender: 'female',
      city: 'Austin',
      state: 'TX',
      primarySport: 'running',
      bio: 'Ultra-marathoner and trail running enthusiast.',
      instagram: '@sarah_runs_trails',
      createdAt: '2024-01-10T08:15:00.000Z',
      updatedAt: '2024-01-10T08:15:00.000Z',
      status: 'active'
    }
  ];

  const loadAthletesFromAPI = async () => {
    setLoading(true);
    
    console.log('🔄 Loading athletes from API...');
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('http://localhost:3001/api/athletes', {
      //   method: 'GET',
      //   headers: { 
      //     'Content-Type': 'application/json'
      //   }
      // });

      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setAthletes(mockAthletes);
      toast.success(`Loaded ${mockAthletes.length} athletes from server`);
    } catch (err) {
      console.error('❌ Error loading athletes:', err);
      toast.error('Failed to load athletes: ' + err.message);
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
      // TODO: Replace with actual API call
      // const response = await fetch(`http://localhost:3001/api/athletes/${athlete.id}`, {
      //   method: 'DELETE',
      //   headers: { 
      //     'Content-Type': 'application/json'
      //   }
      // });

      // For now, just remove from local state
      setAthletes(prevAthletes => prevAthletes.filter(a => a.id !== athlete.id));
      setSelectedAthletes(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(athlete.id);
        return newSelected;
      });
      toast.success(`Athlete ${athlete.firstName || athlete.email} deleted successfully`);
    } catch (err) {
      console.error('🗑️ Delete error:', err);
      toast.error('Failed to delete athlete: ' + err.message);
    } finally {
      setAthleteToDelete(null);
    }
  };

  const handleMessageAthlete = (athlete) => {
    const templates = {
      welcomeMessage: `Hi ${athlete.firstName || 'there'}!

Welcome to GoFast! We're excited to have you join our running community.

Complete your profile to get the most out of GoFast: [Profile Link]

Happy running!
GoFast Team`,
      
      trainingReminder: `Hi ${athlete.firstName || 'there'}!

Just checking in on your training progress. How are things going?

Need any help with your training plan or have questions about GoFast?

Keep up the great work!
GoFast Team`
    };

    const template = window.prompt(
      'Choose a message template:\n\n' +
      '1. Welcome Message\n' +
      '2. Training Reminder\n\n' +
      'Or type your custom message:',
      templates.welcomeMessage
    );

    if (template) {
      // TODO: Implement actual messaging backend
      console.log('Message to send:', template);
      console.log('To athlete:', athlete.email);
      toast.success(`Message prepared for ${athlete.email}`);
    }
  };

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
      const allAthleteIds = athletes.map(athlete => athlete.id);
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

  const getDaysSinceCreation = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    loadAthletesFromAPI();
  }, []);

  return (
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
                onClick={loadAthletesFromAPI} 
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
              {/* Profile Completeness Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Profile Completeness Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['Complete', 'Partial', 'Incomplete'].map(status => {
                    const count = athletes.filter(athlete => {
                      const completeness = getProfileCompleteness(athlete);
                      return completeness.label === status;
                    }).length;
                    return (
                      <div key={status} className="text-center">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          status === 'Complete' ? 'bg-green-100 text-green-800' :
                          status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {status}
                        </div>
                        <div className="text-2xl font-bold mt-1">{count}</div>
                        <div className="text-xs text-gray-600">{status} profiles</div>
                      </div>
                    );
                  })}
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
                  const daysSinceCreation = getDaysSinceCreation(athlete.createdAt);
                  const isSelected = selectedAthletes.has(athlete.id);
                  
                  return (
                    <div key={athlete.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                      isSelected ? 'ring-2 ring-orange-500' : ''
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleSelectAthlete(athlete.id)}
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
                              {athlete.firstName && athlete.lastName ? `${athlete.firstName} ${athlete.lastName}` : 'No Name Set'}
                            </div>
                            <div className="text-sm text-gray-600">{athlete.email}</div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Created: {formatDate(athlete.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Key className="h-3 w-3" />
                                  Firebase: {athlete.firebaseId ? athlete.firebaseId.substring(0, 8) + '...' : 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {daysSinceCreation === 'Unknown' ? 'Created: Unknown' : `Created ${daysSinceCreation} days ago`}
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
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMessageAthlete(athlete)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement athlete modification
                            console.log('Modify athlete:', athlete.id);
                            toast.success('Athlete modification coming soon!');
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modify
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAthlete(athlete)}
                          title="Delete athlete"
                          disabled={athleteToDelete?.id === athlete.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {athleteToDelete?.id === athlete.id ? 'Deleting...' : 'Delete'}
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
  );
};

export default AdminAthletes;
