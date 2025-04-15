import { Logger } from 'oidc-client-ts'
import { useEffect } from 'react'
import { useAuth } from 'react-oidc-context'
import { useNavigate } from 'react-router'

export default function PageRedirectSignin() {
  const auth = useAuth()
  const navigate = useNavigate()


  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        // Si l'utilisateur est authentifié, vérifier si son e-mail est confirmé
        if (auth.user?.profile && auth.user.profile.email_verified) {
          Logger.info('User is authenticated and email is verified. Redirecting to main application.');
          navigate('/servers'); 
        } else {
          Logger.info('User is authenticated but email is not verified. Redirecting to confirmation page.');
          navigate('/authentication/confirmation', { replace: true });
        }
      } else {
        Logger.info('User is not authenticated, redirecting to signin.');
        auth.signinRedirect().catch((err) => {
          Logger.error("Error during signinRedirect:", err);
        });
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, auth.signinRedirect, navigate]);

  return null
}
