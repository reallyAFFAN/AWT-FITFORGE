
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ requireAdmin = false }) {
  const {
    user,
    isAuthenticated,
    isLoadingUser,
  } = useAuth();

  const location = useLocation();

  console.log('[Route Check]', {
    path: location.pathname,
    requireAdmin,
    isAuthenticated,
    isLoadingUser,
    userRole: user?.role,
    user,
  });

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
        Checking your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (requireAdmin && user?.role !== 'admin') {
    console.error('[Admin Route Blocked]', {
      expectedRole: 'admin',
      actualRole: user?.role,
    });

    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
