import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Users, Activity, BarChart3, MessageSquare, Settings, LogOut } from 'lucide-react';

const AdminDashboardChoices = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const dashboardOptions = [
    {
      title: 'Athlete Management',
      description: 'View and manage all GoFast athletes, their profiles, and account status',
      icon: <Users className="h-8 w-8" />,
      path: '/athlete-admin',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Activity Tracking',
      description: 'Monitor athlete activities, training progress, and performance metrics',
      icon: <Activity className="h-8 w-8" />,
      path: '/activity-admin',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View platform statistics, user engagement, and growth metrics',
      icon: <BarChart3 className="h-8 w-8" />,
      path: '/analytics-admin',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Message Center',
      description: 'Send messages to athletes, manage communications, and notifications',
      icon: <MessageSquare className="h-8 w-8" />,
      path: '/message-center',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings, manage admin accounts, and system preferences',
      icon: <Settings className="h-8 w-8" />,
      path: '/settings-admin',
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GoFast Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your GoFast platform and athlete community</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Dashboard Options */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardOptions.map((option, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(option.path)}
            >
              <CardHeader>
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${option.color} mb-4`}>
                  {option.icon}
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <CardDescription className="text-base">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Access {option.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of your GoFast platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Total Athletes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Active This Week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-600">New This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Completed Profiles</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardChoices;
