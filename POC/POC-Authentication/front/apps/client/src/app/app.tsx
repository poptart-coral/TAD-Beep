import { LoadingScreen } from '@beep/ui';
import { Toaster } from 'react-hot-toast';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { NotificationsHandler } from '@beep/notifications';
import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userActions, getUserState } from '@beep/user';

export default function App() {
  const auth = useAuth();
  const dispatch = useDispatch();
  const location = useLocation();
  const userState = useSelector(getUserState);

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && auth.user) {
      dispatch(
        userActions.setTokens({
          accessToken: auth.user.access_token || null,
          refreshToken: auth.user.refresh_token || null,
        })
      );
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, dispatch]);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signinRedirect();
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.signinRedirect]);

  if (auth.isLoading) {
    return <LoadingScreen />;
  }

  if (auth.isAuthenticated && auth.user && auth.user.profile && !auth.user.profile.email_verified && !location.pathname.includes('authentication')) {
    return <Navigate to="/authentication/confirmation" replace />;
  }

  return (
    <>
      <Toaster />
      <Outlet />
    </>
          /*<NotificationsHandler userInfo = {payload} />*/

  );
}
