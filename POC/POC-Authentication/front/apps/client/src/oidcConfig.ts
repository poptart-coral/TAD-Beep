import { AuthProviderProps } from 'react-oidc-context'

const oidcConfig: AuthProviderProps = {
  authority: 'http://localhost:7080/realms/beep',
  client_id: 'front',       
  redirect_uri: window.location.origin,     
  response_type: 'code',                       
  scope: 'openid profile email',
  post_logout_redirect_uri: window.location.origin,
}

export default oidcConfig;
