import { defineConfig } from '@adonisjs/auth'
import { InferAuthEvents, Authenticators, InferAuthenticators } from '@adonisjs/auth/types'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'
import { jwtGuard } from '#apps/authentication/providers/jwt'
import env from '#start/env'
import { Env } from '@adonisjs/core/env'
import { getKey } from '#start/keycloakJwks'

const authConfig = defineConfig({
  default: 'jwt',
  guards: {
    web: sessionGuard({
      useRememberMeTokens: false,
      provider: sessionUserProvider({
        model: () => import('#apps/users/models/user'),
      }),
    }),
    jwt: jwtGuard({
      provider: {
        model: () => import('#apps/users/models/user'),
        tokens: 'accessTokens',
        uids: ['sub'],                              // <- on utilise sub comme ID
      },
      getKey: getKey,                               // <- fonction JWKS
      verifyOptions: {                              // <- issuer + audience
        algorithms: ['RS256'],
        issuer:    env.get('KEYCLOAK_ISSUER'),
        //audience:  process.env.KEYCLOAK_AUDIENCE,
      },
    }),
  },
})

export default authConfig

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
