import { Navigate, Outlet } from 'react-router-dom';
import Loading from '@/components/Loading';
import { useAuth } from '@/context/AuthContext';

function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;