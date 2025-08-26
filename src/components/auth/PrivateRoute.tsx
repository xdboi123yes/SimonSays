import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  
  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }
  
  // Redirect to login if not authenticated or if user data is missing
  if (!isAuthenticated || !user) {
    // Force logout if we have a token but no user data
    if (!user) {
      localStorage.clear();
      sessionStorage.clear();
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Show the protected component if authenticated and user exists
  return <>{children}</>;
};

export default PrivateRoute;