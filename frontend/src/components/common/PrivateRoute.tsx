import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // デバッグ用ログ
  console.log('PrivateRoute - Path:', location.pathname, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    // Love-themed loading screen
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #fdf2f8, #eff6ff)',
      }}>
        <div style={{
          fontSize: '3rem',
          animation: 'heartbeat 1.5s ease-in-out infinite',
        }}>
          💕
        </div>
        <p style={{
          marginTop: '1rem',
          color: '#db2777',
          fontWeight: 'bold',
        }}>
          愛を込めて読み込み中...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they were trying to go to
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};