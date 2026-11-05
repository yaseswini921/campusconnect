import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loading } from './Shared';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (!admin && user.role === 'admin' && location.pathname === '/dashboard') return <Navigate to="/admin" replace />;
  return <Outlet />;
}
