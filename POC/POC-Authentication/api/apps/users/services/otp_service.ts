import redis from '@adonisjs/redis/services/main'
import MailService from '#apps/authentication/services/mail_service'
import crypto from 'node:crypto'
import { EmailUpdateValidator, OtpEmailValidator } from '#apps/users/validators/users'
import { inject } from '@adonisjs/core'

@inject()
export default class OtpService {
  private otpExpiry = 300 // OTP expires in 5 minutes

  constructor(private mailService: MailService) {}

  /**
   * Generate and send OTP for email update
   * @param email - Recipient's email
   */
  public async generateOtp(data: EmailUpdateValidator): Promise<void> {
    const otp = crypto.randomInt(100000, 999999).toString() // Generate 6-digit OTP
    const redisKey = this.getRedisKey(data.email)

    // Store OTP in Redis with expiration
    await redis.setex(redisKey, this.otpExpiry, otp)

    // Send OTP via email
    await this.mailService.sendEmailUpdateMail(data.email, otp)
  }

  /**
   * Verify the provided OTP
   * @param email - Email associated with the OTP
   * @param otp - OTP to verify
   * @returns True if valid, False otherwise
   */
  public async verifyOtp(data: OtpEmailValidator): Promise<boolean> {
    const redisKey = this.getRedisKey(data.email)
    const storedOtp = await redis.get(redisKey)

    if (storedOtp && storedOtp === data.otp) {
      await redis.del(redisKey) // Delete OTP after successful verification
      return true
    }

    return false
  }

  /**
   * Helper: Generate Redis key
   * @param email - Email address
   */
  private getRedisKey(email: string): string {
    return `otp:${email}`
  }
}
