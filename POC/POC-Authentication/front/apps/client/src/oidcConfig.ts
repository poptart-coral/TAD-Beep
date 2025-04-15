import { AuthProviderProps } from 'react-oidc-context'

const oidcConfig: AuthProviderProps = {
  authority: 'http://localhost:7080/realms/beep',          // URL de Keycloak (adaptée à votre configuration)
  client_id: 'front',                     // Votre client Keycloak configuré en mode Public
  redirect_uri: window.location.origin,          // L'URI où l’utilisateur reviendra après authentification
  response_type: 'code',                         // Utilisation du flux code (avec PKCE)
  scope: 'openid profile email',                 // Scopes demandés (adaptables selon vos besoins)
  post_logout_redirect_uri: window.location.origin,
}

export default oidcConfig;
