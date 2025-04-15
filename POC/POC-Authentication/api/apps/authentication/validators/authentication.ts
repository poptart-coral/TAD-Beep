import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const signinAuthenticationValidator = vine.compile(
  vine.object({
    // Email
    email: vine
      .string()
      .email()
      .optional()
      .requiredIfAnyMissing(['token', 'passKey'])
      .requiredIfExists('password'),
    password: vine
      .string()
      .optional()
      .requiredIfAnyMissing(['token', 'passKey'])
      .requiredIfExists('email'),
    // TOTP token when login with email/password
    totpToken: vine.string().optional(),
    // QR code token
    token: vine
      .string()
      .optional()
      .requiredIfAnyMissing(['email', 'password'])
      .requiredIfExists('passKey'),
    passKey: vine
      .string()
      .optional()
      .requiredIfAnyMissing(['email', 'password'])
      .requiredIfExists('token'),
  })
)

export const checkPasswordValidator = vine.compile(
  vine.object({
    password: vine.string(),
  })
)

export const checkTotpValidator = vine.compile(
  vine.object({
    totp: vine.string(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
)

/**
 * Validator to validate the payload when creating
 * a new authentication.ts.
 */
export const createAuthenticationValidator = vine.compile(
  vine.object({
    username: vine.string(),
    firstName: vine.string(),
    lastName: vine.string(),
    email: vine.string(),
    password: vine.string(),
    profilePicture: vine.file().nullable().optional(),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing authentication.ts.
 */
export const updateAuthenticationValidator = vine.compile(vine.object({}))

export type SigninAuthenticationSchema = Infer<typeof signinAuthenticationValidator>
export type CreateAuthenticationSchema = Infer<typeof createAuthenticationValidator>
export type UpdateAuthenticationSchema = Infer<typeof updateAuthenticationValidator>
export type ResetPasswordValidator = Infer<typeof resetPasswordValidator>
