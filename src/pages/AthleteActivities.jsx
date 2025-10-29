import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Calendar, MapPin, TrendingUp, Clock, Ruler, Heart, Zap, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import toast, { Toaster } from 'react-hot-toast';

const AthleteActivities = () => {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState(null);

  useEffect(() => {
    loadAthleteInfo();
    loadActivities();
  }, [athleteId]);

  const loadAthleteInfo = () => {
    // Get athlete info from localStorage
    try {
      const storedAthletes = localStorage.getItem('athletesData');
      if (storedAthletes) {
        const athletes = JSON.parse(storedAthletes);
        const foundAthlete = athletes.find(a => 
          (a.athleteId || a.id) === athleteId
        );
        if (foundAthlete) {
          setAthlete(foundAthlete);
        }
      }
    } catch (error) {
      console.error('Error loading athlete info:', error);
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Loading activities for athleteId:', athleteId);
      
      const response = await fetch(
        `https://gofastbackendv2-fall2025.onrender.com/api/athlete/${athleteId}/activities`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No activities found - that's okay
          setActivities([]);
          toast.info('No activities found for this athlete');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Activities loaded:', data);
      
      if (data.success && data.activities) {
        setActivities(data.activities);
        toast.success(`Loaded ${data.activities.length} activities`);
      } else if (data.activities) {
        // Handle case where response is just array
        setActivities(Array.isArray(data.activities) ? data.activities : []);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('❌ Error loading activities:', error);
      toast.error('Failed to load activities: ' + error.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
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

  const getActivityTypeIcon = (activityType) => {
    const type = (activityType || '').toLowerCase();
    if (type.includes('run')) return '🏃';
    if (type.includes('bike') || type.includes('cycling')) return '🚴';
    if (type.includes('swim')) return '🏊';
    if (type.includes('walk')) return '🚶';
    return '🏃';
  };

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/athlete/${athleteId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Athlete
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Activities
              {athlete && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  - {athlete.firstName} {athlete.lastName}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500">
              All activities synced from Garmin Connect
            </p>
          </div>
        </div>
        <Button
          onClick={loadActivities}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2">Loading activities...</span>
          </CardContent>
        </Card>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="text-center p-8">
            <Activity className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
            <p className="text-gray-600 mb-4">
              This athlete hasn't synced any activities from Garmin Connect yet.
            </p>
            <p className="text-sm text-gray-500">
              Activities will appear here once they complete a workout and Garmin sends the webhook.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{activities.length}</div>
                <div className="text-sm text-gray-600">Total Activities</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {activities.reduce((sum, a) => sum + (a.duration || 0), 0) > 0 
                    ? formatDuration(activities.reduce((sum, a) => sum + (a.duration || 0), 0))
                    : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {activities.reduce((sum, a) => sum + (a.distance || 0), 0) > 0
                    ? `${(activities.reduce((sum, a) => sum + (a.distance || 0), 0) / 1000).toFixed(2)} km`
                    : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Total Distance</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {activities.filter(a => a.startTime).length > 0
                    ? formatDate(Math.max(...activities.filter(a => a.startTime).map(a => new Date(a.startTime).getTime())))
                    : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Most Recent</div>
              </CardContent>
            </Card>
          </div>

          {/* Activities List */}
          {activities.map((activity, index) => (
            <Card key={activity.id || activity.sourceActivityId || index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {getActivityTypeIcon(activity.activityType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {activity.activityName || activity.activityType || 'Activity'}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                
                {(activity.elevationGain || activity.maxHeartRate || activity.averageSpeed) && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                    {activity.elevationGain && (
                      <div>
                        <div className="text-xs text-gray-500">Elevation Gain</div>
                        <div className="text-sm font-medium">{activity.elevationGain.toFixed(0)} m</div>
                      </div>
                    )}
                    {activity.maxHeartRate && (
                      <div>
                        <div className="text-xs text-gray-500">Max Heart Rate</div>
                        <div className="text-sm font-medium">{activity.maxHeartRate} bpm</div>
                      </div>
                    )}
                    {activity.averageSpeed && (
                      <div>
                        <div className="text-xs text-gray-500">Avg Speed</div>
                        <div className="text-sm font-medium">{(activity.averageSpeed * 3.6).toFixed(2)} km/h</div>
                      </div>
                    )}
                  </div>
                )}

                {activity.sourceActivityId && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      Garmin Activity ID: <span className="font-mono">{activity.sourceActivityId}</span>
                    </div>
                    {activity.syncedAt && (
                      <div className="text-xs text-gray-500">
                        Synced: {formatDate(activity.syncedAt)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AthleteActivities;

