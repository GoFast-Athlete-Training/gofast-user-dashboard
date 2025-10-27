import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const AdminHome = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleEnterAdmin = async () => {
    try {
      // Auto-login without credentials
      const result = await login('admin', 'gofast2025');
      
      if (result.success) {
        toast.success('Welcome to GoFast Admin!');
        navigate('/admin');
      } else {
        toast.error('Failed to enter admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to enter admin');
    }
  };

  // Check if already logged in and redirect
  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn) {
      navigate('/admin');
    }
  }, [navigate]);

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
