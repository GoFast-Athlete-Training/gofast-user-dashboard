import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, MapPin, Activity, Shield, Key, Edit, Save, X, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import Navbar from '../components/Navbar';
import AdminUpsertWizard from '../components/AdminUpsertWizard.jsx';
import toast, { Toaster } from 'react-hot-toast';

const AthleteDetails = () => {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [upsertWizardOpen, setUpsertWizardOpen] = useState(false);

  useEffect(() => {
    loadAthleteDetails();
  }, [athleteId]);

  const loadAthleteDetails = () => {
    setLoading(true);
    
    try {
      // Get from localStorage first (globally hydrated data)
      const storedAthletes = localStorage.getItem('athletesData');
      
      if (storedAthletes) {
        const athletes = JSON.parse(storedAthletes);
        const foundAthlete = athletes.find(a => 
          (a.athleteId || a.id) === athleteId
        );
        
        if (foundAthlete) {
          setAthlete(foundAthlete);
          setEditData(foundAthlete);
          console.log('✅ Found athlete in cache:', foundAthlete);
        } else {
          console.error('❌ Athlete not found in cache');
          toast.error('Athlete not found');
        }
      } else {
        console.error('❌ No cached athlete data');
        toast.error('No athlete data available');
      }
    } catch (error) {
      console.error('❌ Error loading athlete:', error);
      toast.error('Failed to load athlete details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditData({ ...athlete });
  };

  const handleSave = async () => {
    try {
      const athleteId = athlete.athleteId || athlete.id;
      console.log('💾 Saving athlete data:', editData);
      
      const response = await fetch(
        `https://gofastbackendv2-fall2025.onrender.com/api/athlete/${athleteId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedAthlete = await response.json();
      console.log('✅ Athlete updated:', updatedAthlete);
      
      // Update local state
      setAthlete(updatedAthlete.athlete || updatedAthlete);
      setEditing(false);
      
      // Update localStorage cache
      const storedAthletes = JSON.parse(localStorage.getItem('athletesData') || '[]');
      const updatedAthletes = storedAthletes.map(a => 
        (a.athleteId || a.id) === athleteId ? (updatedAthlete.athlete || updatedAthlete) : a
      );
      localStorage.setItem('athletesData', JSON.stringify(updatedAthletes));
      
      toast.success('Athlete updated successfully!');
    } catch (error) {
      console.error('❌ Error saving athlete:', error);
      toast.error('Failed to save athlete: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ ...athlete });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProfileCompleteness = (athlete) => {
    const requiredFields = ['firstName', 'lastName', 'gofastHandle', 'birthday', 'gender', 'city', 'state', 'primarySport'];
    const completedFields = requiredFields.filter(field => athlete[field] && athlete[field].toString().trim() !== '');
    const completeness = (completedFields.length / requiredFields.length) * 100;
    
    if (completeness >= 80) {
      return { label: 'Complete', color: 'bg-green-100 text-green-800', percentage: completeness };
    } else if (completeness >= 50) {
      return { label: 'Partial', color: 'bg-yellow-100 text-yellow-800', percentage: completeness };
    } else {
      return { label: 'Incomplete', color: 'bg-red-100 text-red-800', percentage: completeness };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2">Loading athlete details...</span>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Athlete Not Found</h2>
            <p className="text-gray-600 mb-4">The requested athlete could not be found.</p>
            <Button onClick={() => navigate('/athlete-admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Athletes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileCompleteness = getProfileCompleteness(athlete);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/athlete-admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Athletes
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Athlete Details</h1>
            <p className="text-gray-600">View and manage athlete information</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Athlete
              </Button>
              <Button
                onClick={() => setUpsertWizardOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to New Model
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold">
                  {athlete.firstName && athlete.lastName 
                    ? `${athlete.firstName} ${athlete.lastName}` 
                    : 'No Name Set'
                  }
                </h2>
                <p className="text-gray-600">{athlete.email}</p>
                {athlete.gofastHandle && (
                  <p className="text-blue-600 font-medium">@{athlete.gofastHandle}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm"><strong>Athlete ID:</strong> {athlete.athleteId || athlete.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-gray-500" />
                  <span className="text-sm"><strong>Firebase ID:</strong> {athlete.firebaseId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm"><strong>Joined:</strong> {formatDate(athlete.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <span className="text-sm"><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      athlete.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {athlete.status || 'active'}
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Profile completeness: <span className={`px-2 py-1 rounded-full text-xs font-medium ${profileCompleteness.color}`}>
                  {profileCompleteness.label} ({Math.round(profileCompleteness.percentage)}%)
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Athlete ID</label>
                  <p className="text-gray-900 font-mono text-sm">{athlete.athleteId || athlete.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firebase ID</label>
                  <p className="text-gray-900 font-mono text-sm">{athlete.firebaseId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{athlete.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    athlete.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {athlete.status || 'active'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.firstName || ''}
                      onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete.firstName || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.lastName || ''}
                      onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete.lastName || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GoFast Handle</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.gofastHandle || ''}
                      onChange={(e) => setEditData({...editData, gofastHandle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="@username"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete.gofastHandle ? `@${athlete.gofastHandle}` : 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                  {editing ? (
                    <input
                      type="date"
                      value={editData.birthday || ''}
                      onChange={(e) => setEditData({...editData, birthday: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete.birthday || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  {editing ? (
                    <select
                      value={editData.gender || ''}
                      onChange={(e) => setEditData({...editData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{athlete.gender || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                  <p className="text-gray-900">{athlete.photoURL || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Sport */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Sport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.city || ''}
                      onChange={(e) => setEditData({...editData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete.city || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.state || ''}
                      onChange={(e) => setEditData({...editData, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete.state || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Sport</label>
                  {editing ? (
                    <select
                      value={editData.primarySport || ''}
                      onChange={(e) => setEditData({...editData, primarySport: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select sport</option>
                      <option value="running">Running</option>
                      <option value="cycling">Cycling</option>
                      <option value="swimming">Swimming</option>
                      <option value="triathlon">Triathlon</option>
                      <option value="weightlifting">Weightlifting</option>
                      <option value="yoga">Yoga</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{athlete.primarySport || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.instagram || ''}
                      onChange={(e) => setEditData({...editData, instagram: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="@username"
                    />
                  ) : (
                    <p className="text-gray-900">{athlete.instagram || 'Not set'}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {editing ? (
                    <textarea
                      value={editData.bio || ''}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-900">{athlete.bio || 'No bio provided'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Garmin Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Garmin Integration
                </CardTitle>
                <Button
                  onClick={() => navigate(`/athlete/${athleteId}/activities`)}
                  variant="outline"
                  size="sm"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View Activities
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connected</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    athlete.garmin?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {athlete.garmin?.connected ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Garmin User ID</label>
                  <p className="text-gray-900 font-mono text-sm">{athlete.garmin?.userId || 'Not connected'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connected At</label>
                  <p className="text-gray-900">{athlete.garmin?.connectedAt ? formatDate(athlete.garmin.connectedAt) : 'Not connected'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Sync At</label>
                  <p className="text-gray-900">{athlete.garmin?.lastSyncAt ? formatDate(athlete.garmin.lastSyncAt) : 'Never synced'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                  <p className="text-gray-900">{athlete.garmin?.scope || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Has Tokens</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    athlete.garmin?.hasTokens ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {athlete.garmin?.hasTokens ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Token Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    athlete.garmin?.tokenStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {athlete.garmin?.tokenStatus || 'none'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps & Computed Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timestamps & Computed Fields
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-gray-900">{formatDate(athlete.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                  <p className="text-gray-900">{formatDate(athlete.updatedAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900">{athlete.fullName || 'No Name Set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Complete</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    athlete.profileComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {athlete.profileComplete ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days Since Creation</label>
                  <p className="text-gray-900">{athlete.daysSinceCreation || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>

      {/* Upsert Wizard Modal */}
      <AdminUpsertWizard
        isOpen={upsertWizardOpen}
        onClose={() => setUpsertWizardOpen(false)}
        athlete={athlete}
      />
    </div>
  );
};

export default AthleteDetails;
