import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import { Users, Database, BarChart3, MessageSquare, Settings, Zap, Activity, Users2 } from 'lucide-react';

const DashboardNavOptions = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    athletes: 0,
    runCrews: 0,
    activeThisWeek: 0,
    newThisMonth: 0,
    completedProfiles: 0
  });

  // Load stats from localStorage
  useEffect(() => {
    try {
      const athletesData = localStorage.getItem('athletesData');
      const runCrewsData = localStorage.getItem('runCrewsData');
      
      if (athletesData) {
        try {
          const athletes = JSON.parse(athletesData);
          if (Array.isArray(athletes)) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const activeThisWeek = athletes.filter(a => {
              try {
                const updated = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
                return updated >= sevenDaysAgo;
              } catch {
                return false;
              }
            }).length;
            
            const newThisMonth = athletes.filter(a => {
              try {
                const created = new Date(a.createdAt);
                return created >= thirtyDaysAgo;
              } catch {
                return false;
              }
            }).length;
            
            const completedProfiles = athletes.filter(a => 
              a.firstName && a.lastName && a.city && a.primarySport
            ).length;
            
            setStats(prev => ({
              ...prev,
              athletes: athletes.length,
              activeThisWeek,
              newThisMonth,
              completedProfiles
            }));
          }
        } catch (error) {
          console.error('Error parsing athletes data:', error);
        }
      }
      
      if (runCrewsData) {
        try {
          const runCrews = JSON.parse(runCrewsData);
          if (Array.isArray(runCrews)) {
            setStats(prev => ({
              ...prev,
              runCrews: runCrews.length
            }));
          }
        } catch (error) {
          console.error('Error parsing runCrews data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  const navOptions = [
    {
      title: 'Athlete Management',
      description: 'View and manage all GoFast athletes, their profiles, and account status',
      icon: <Users className="h-8 w-8" />,
      path: '/athlete-admin',
      color: 'bg-blue-100 text-blue-600',
      priority: 'high'
    },
    {
      title: 'RunCrews Management',
      description: 'View and manage all RunCrews, members, and crew activities',
      icon: <Users2 className="h-8 w-8" />,
      path: '/runcrews-admin',
      color: 'bg-purple-100 text-purple-600',
      priority: 'high'
    },
    {
      title: 'All Activities',
      description: 'Debug view - see all activities across all athletes in the system',
      icon: <Activity className="h-8 w-8" />,
      path: '/all-activities',
      color: 'bg-green-100 text-green-600',
      priority: 'high'
    }
  ];

  const highPriorityOptions = navOptions.filter(option => option.priority === 'high');
  const lowPriorityOptions = navOptions.filter(option => option.priority === 'low');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GoFast Admin Hub</h1>
            <p className="text-gray-600 mt-2">Manage your GoFast platform and athlete community</p>
        </div>
      </div>

      {/* High Priority Options */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">🚀 Essential Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highPriorityOptions.map((option, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-300"
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
                <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600">
                  Open {option.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Low Priority Options */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">📊 Additional Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lowPriorityOptions.map((option, index) => (
            <Card 
              key={index} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(option.path)}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${option.color} mb-3`}>
                  {option.icon}
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full" variant="outline" size="sm">
                  Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Current state of your GoFast platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.athletes}</div>
                <div className="text-sm text-gray-600">Total Athletes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.runCrews}</div>
                <div className="text-sm text-gray-600">Total RunCrews</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.activeThisWeek}</div>
                <div className="text-sm text-gray-600">Active This Week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.newThisMonth}</div>
                <div className="text-sm text-gray-600">New This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{stats.completedProfiles}</div>
                <div className="text-sm text-gray-600">Completed Profiles</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default DashboardNavOptions;
