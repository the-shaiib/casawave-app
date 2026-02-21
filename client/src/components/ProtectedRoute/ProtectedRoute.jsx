import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

const ADMIN_TOKEN_KEY = 'casawave_token';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAdminAuthenticated } = useStore();
  const hasToken =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem(ADMIN_TOKEN_KEY));

  if (!isAdminAuthenticated || !hasToken) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
