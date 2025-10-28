import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // TEMPORARY: Allow access without admin check for testing
  // TODO: Re-enable admin check when ready
  // if (!isAdmin) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export default ProtectedRoute;
