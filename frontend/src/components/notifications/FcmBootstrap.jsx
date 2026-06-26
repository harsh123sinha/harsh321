import { useAuth } from '../../contexts/AuthContext';
import useFcm from '../../hooks/useFcm';

/** Registers FCM token when user is logged in */
const FcmBootstrap = () => {
  const { isAuthenticated } = useAuth();
  useFcm(isAuthenticated);
  return null;
};

export default FcmBootstrap;
