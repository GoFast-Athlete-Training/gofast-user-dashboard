import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, RefreshCw, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const AllActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAllActivities = async () => {
    setLoading(true);
    
    try {
      console.log('🔍 Loading ALL activities from backend...');
      
      const response = await fetch(
        'https://gofastbackendv2-fall2025.onrender.com/api/athlete/activities',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ All activities loaded:', data);
      
      if (data.success && data.activities) {
        setActivities(data.activities);
        toast.success(`Loaded ${data.activities.length} activities (total: ${data.totalCount})`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error loading activities:', error);
      toast.error('Failed to load activities: ' + error.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDistance = (meters) => {
    if (!meters) return 'N/A';
    const kilometers = (meters / 1000).toFixed(2);
    const miles = (meters / 1609.34).toFixed(2);
    return `${kilometers} km (${miles} mi)`;
  };

  useEffect(() => {
    loadAllActivities();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">All Activities</h1>
            <p className="text-sm text-gray-500">
              Debug view - ALL activities in the system
            </p>
          </div>
        </div>
        <Button
          onClick={loadAllActivities}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-2">Loading all activities...</span>
          </CardContent>
        </Card>
      ) : activities.length === 0 ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">NO ACTIVITIES FOUND</h3>
            <p className="text-red-700 mb-4">
              This means either:
            </p>
            <ul className="text-red-700 text-left max-w-md mx-auto">
              <li>• No Garmin webhooks have been received</li>
              <li>• Webhooks are failing to save to database</li>
              <li>• Database connection issues</li>
            </ul>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{activities.length}</div>
                <div className="text-sm text-gray-600">Total Activities</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(activities.map(a => a.athleteId)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Athletes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {activities.filter(a => a.athlete).length}
                </div>
                <div className="text-sm text-gray-600">With Athlete Info</div>
              </CardContent>
            </Card>
          </div>

          {/* Activities List */}
          {activities.map((activity, index) => (
            <Card key={activity.id || index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🏃</div>
                    <div>
                      <CardTitle className="text-lg">
                        {activity.activityName || activity.activityType || 'Unknown Activity'}
                      </CardTitle>
                      <CardDescription>
                        {activity.activityType || 'Unknown Type'}
                      </CardDescription>
                    </div>
                  </div>
                  {activity.startTime && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(activity.startTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.startTime).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {activity.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium">{formatDuration(activity.duration)}</div>
                        <div className="text-xs text-gray-500">Duration</div>
                      </div>
                    </div>
                  )}
                  {activity.distance && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium">{formatDistance(activity.distance)}</div>
                        <div className="text-xs text-gray-500">Distance</div>
                      </div>
                    </div>
                  )}
                  {activity.averageHeartRate && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-400" />
                      <div>
                        <div className="text-sm font-medium">{activity.averageHeartRate} bpm</div>
                        <div className="text-xs text-gray-500">Avg Heart Rate</div>
                      </div>
                    </div>
                  )}
                  {activity.calories && (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <div>
                        <div className="text-sm font-medium">{activity.calories}</div>
                        <div className="text-xs text-gray-500">Calories</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Athlete Info */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Athlete ID</div>
                      <div className="text-sm font-mono">{activity.athleteId || 'MISSING'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Garmin User ID</div>
                      <div className="text-sm font-mono">{activity.garminUserId || 'MISSING'}</div>
                    </div>
                    {activity.athlete && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500">Athlete Info</div>
                        <div className="text-sm">
                          {activity.athlete.firstName} {activity.athlete.lastName} ({activity.athlete.email})
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500">Synced At</div>
                      <div className="text-sm">{formatDate(activity.syncedAt)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Source Activity ID</div>
                      <div className="text-sm font-mono">{activity.sourceActivityId || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllActivities;
