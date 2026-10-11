import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard.
 *  - not logged in            -> /login
 *  - logged in, wrong role    -> dashboard
 * NOTE: this only improves the user experience. The REAL protection is @PreAuthorize on the backend.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}
