import { inject } from '@adonisjs/core'
import env from '#start/env'
import jwt from 'jsonwebtoken'

export interface PayloadJWTSFUConnection {
  name?: string
}

@inject()
export default class TokenService {
  generateToken(payload: PayloadJWTSFUConnection): string {
    return jwt.sign(payload, env.get('APP_KEY'))
  }
}
