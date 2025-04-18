import jwksRsa from 'jwks-rsa'
import jwt from 'jsonwebtoken'
import env from './env.js'

const jwksClient = jwksRsa(
    {
        jwksUri: env.get('KEYCLOAK_JWKS_URI') || '',
        cache: true,
        rateLimit: true,
        
    }
)

export function getKey(
    header: jwt.JwtHeader,
    callback: jwt.SigningKeyCallback
) {
    console.log('[JWT GUARD] getKey called, kid=', header.kid)

    if(!header.kid) {
        return callback(new Error('No kid found in header'))
    }
    jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
            console.error('[JWT GUARD] JWKS fetch error:', err)
            return callback(err)
        }
        if (!key) return callback(new Error('No key found'))
        const pub = key.getPublicKey()
        console.log('[JWT GUARD] Retrieved publicKey (truncated)=', (pub as string).slice(0, 30))

        callback(null, pub)
    })
}