import { CreateAuthenticationSchema } from '#apps/authentication/validators/authentication'
import { errors as authErrors } from '@adonisjs/auth'
import { UpdatePasswordValidator } from '#apps/authentication/validators/verify'
import EmailAlreadyExistsExeption from '#apps/users/exceptions/email_already_exists_exception'
import UserNotFoundException from '#apps/users/exceptions/user_not_found_exception'
import UsernameAlreadyExistsExeption from '#apps/users/exceptions/username_already_exists_exception'
import Token from '#apps/users/models/token'
import User from '#apps/users/models/user'
import env from '#start/env'
import { Authenticator, errors } from '@adonisjs/auth'
import logger from '@adonisjs/core/services/logger'
import jwt from 'jsonwebtoken'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import redis from '@adonisjs/redis/services/main'
import transmit from '@adonisjs/transmit/services/main'
import { Authenticators } from '@adonisjs/auth/types'
import { authenticator } from 'otplib'
import InvalidQRCodeException from '#apps/users/exceptions/invalid_qrcode_exception'
import TotpMissingException from '#apps/users/exceptions/totp_missing_exception'
import CurrentPasswordMismatchException from '../exceptions/current_password_mismatch_exception.js'

export default class AuthenticationService {
  DEFAULT_PP_URL = 'default_profile_picture.png'

  async verifyToken(token: string) {
    try {
      const decodedToken = jwt.decode(token, { complete: true })
      const algorithm = decodedToken?.header.alg as jwt.Algorithm

      return jwt.verify(token, env.get('APP_KEY'), { algorithms: [algorithm] })
    } catch (e) {
      logger.warn(e)
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: 'jwt',
      })
    }
  }

  async registerUser(schemaUser: CreateAuthenticationSchema): Promise<User> {
    const usernameExists = await User.findBy('username', schemaUser.username)
    if (usernameExists) {
      throw new UsernameAlreadyExistsExeption('Username already exists', {
        code: 'E_USERNAME_ALREADY_EXISTS',
        status: 400,
      })
    }

    const emailExists = await User.findBy('email', schemaUser.email.toLowerCase())
    if (emailExists) {
      throw new EmailAlreadyExistsExeption('User already exists', {
        code: 'E_MAIL_ALREADY_EXISTS',
        status: 400,
      })
    }

    const user = await User.create({
      username: schemaUser.username,
      firstName: schemaUser.firstName,
      lastName: schemaUser.lastName,
      email: schemaUser.email.toLowerCase(),
      password: schemaUser.password,
      profilePicture: this.DEFAULT_PP_URL,
    })

    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await User.findBy('email', email.toLowerCase())

    return user
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = await User.findBy('username', username)

    return user
  }

  async createToken(user: User): Promise<Token> {
    const currentDate: DateTime = DateTime.now()

    const token = await Token.create({
      token: crypto.randomBytes(100).toString('hex'),
      ownerId: user.id,
      createdAt: currentDate,
      desactivatedAt: currentDate.plus({
        hour: 2,
      }),
    })

    return token
  }

  async verifyEmail(token: string): Promise<boolean> {
    const tokenEntity = await Token.query().where('token', token).firstOrFail()

    const user = await User.findOrFail(tokenEntity.ownerId).catch(() => {
      throw new UserNotFoundException('User not found', {
        status: 404,
        code: 'E_ROWNOTFOUND',
      })
    })

    if (user.verifiedAt !== null) return true

    if (tokenEntity.desactivatedAt < DateTime.now()) return false

    user.verifiedAt = DateTime.now()
    await user.save()

    return true
  }

  async updateNewPassword(email: string, validator: UpdatePasswordValidator) {
    // On vérifie les mots de passes
    const user = await User.verifyCredentials(email, validator.oldPassword).catch(() => {
      throw new CurrentPasswordMismatchException(
        'The inserted password is not matching the current one',
        {
          code: 'E_CURRENT_PASSWORD_MISMATCHING',
          status: 400,
        }
      )
    })

    // Si les mdp correspondent on maj
    user.password = validator.newPassword
    await user.save()
  }

  async verifyResetPassword(token: string, newPassword: string): Promise<boolean> {
    const tokenEntity = await Token.query().where('token', token).firstOrFail()
    const user = await User.findOrFail(tokenEntity.ownerId).catch(() => {
      throw new UserNotFoundException('User not found', {
        status: 404,
        code: 'E_ROWNOTFOUND',
      })
    })

    if (tokenEntity.desactivatedAt < DateTime.now()) return false

    if (user === null) return false

    user.password = newPassword
    await user.save()

    return true
  }

  async generateQRCodeToken() {
    const token = crypto.randomBytes(100).toString('hex')
    await redis.set(`qr-code:${token}`, 'generated', 'EX', 300)

    return token
  }

  async validateQRCodeToken(token: string, userid: string): Promise<boolean> {
    const isValid = await redis.get(`qr-code:${token}`)
    if (isValid === 'pending') {
      const passKey = crypto.randomBytes(50).toString('hex')
      await redis.set(`qr-code:${token}`, 'validated', 'EX', 300)
      await redis.set(`qr-code:${token}:user`, userid, 'EX', 300)
      await redis.set(`qr-code:${token}:passkey`, passKey, 'EX', 300)
      transmit.broadcast(`qr-code/${token}`, `${passKey}`)
      return true
    }

    return false
  }

  async retrieveUserQRCode(token: string, passKey: string): Promise<User> {
    const isValid = await redis.get(`qr-code:${token}`)
    if (isValid !== 'validated') {
      throw new InvalidQRCodeException('QRCode is not valid', {
        status: 403,
        code: 'E_FORBIDDEN',
      })
    }
    const passKeyStored = await redis.get(`qr-code:${token}:passkey`)
    if (passKeyStored !== passKey) {
      throw new InvalidQRCodeException('Wrong Passkey', {
        status: 403,
        code: 'E_FORBIDDEN',
      })
    }
    const userId = await redis.get(`qr-code:${token}:user`)
    await redis.del(`qr-code:${token}:user`)
    await redis.del(`qr-code:${token}`)
    await redis.del(`qr-code:${token}:passkey`)
    const user = await User.findOrFail(userId).catch(() => {
      throw new authErrors.E_UNAUTHORIZED_ACCESS('User not found', {
        guardDriverName: 'jwt',
      })
    })
    return user
  }

  async handleSignIn(user: User, auth: Authenticator<Authenticators>) {
    const tokens = await auth.use('jwt').generate(user)

    await redis.hset(
      'userStates',
      user.id,
      JSON.stringify({
        id: user.id,
        username: user.username,
        expiresAt: Date.now() + 1200 * 1000, // Timestamp now + 20 minutes
      })
    )

    transmit.broadcast('users/state', {
      message: 'update user connected',
    })

    return {
      user,
      tokens,
    }
  }

  async checkPassword(userId: string, password: string): Promise<boolean> {
    const user = await User.findOrFail(userId)
    return !!(await User.verifyCredentials(user.email, password))
  }

  async generateTOTPURI(userId: string) {
    //edit user to add TOTP secret
    const secret = authenticator.generateSecret()
    logger.info(secret)
    const user = await User.findOrFail(userId)
    user.TOTPSecret = secret
    await user.save()
    const otpauth = authenticator.keyuri(user.email, 'Beep', secret)
    logger.debug(otpauth)

    return otpauth
  }

  async verifyTOTP(userId: string, totp: string): Promise<boolean> {
    const user = await User.findOrFail(userId)
    const secret = user.TOTPSecret

    return authenticator.check(totp, secret)
  }

  async disable2FA(userId: string): Promise<void> {
    const user = await User.findOrFail(userId)
    user.TOTPAuthentication = false
    await user.save()
  }

  async finalize2FA(userId: string): Promise<void> {
    const user = await User.findOrFail(userId)
    user.TOTPAuthentication = true
    await user.save()
  }

  async authenticate(email: string, password: string): Promise<User> {
    const user = await User.verifyCredentials(email, password)
    if (user.TOTPAuthentication) {
      throw new TotpMissingException('Missing totp token', {
        status: 403,
        code: 'E_MISSING_TOTP_TOKEN',
      })
    }
    return user
  }

  async authenticateWithTotp(email: string, password: string, totpToken: string) {
    const user = await User.verifyCredentials(email, password)
    if (!authenticator.verify({ token: totpToken, secret: user.TOTPSecret })) {
      throw new TotpMissingException('Wrong totp token', {
        status: 403,
        code: 'E_WRONG_TOTP_TOKEN',
      })
    }
    return user
  }
}
