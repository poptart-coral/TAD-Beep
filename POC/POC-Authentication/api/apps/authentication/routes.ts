import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { throttleSignUp } from '#start/limiter'

const AuthenticationController = () =>
  import('#apps/authentication/controllers/authentication_controller')

router
  .group(() => {
    router.post('/signin', [AuthenticationController, 'signin'])
    router.post('/signup', [AuthenticationController, 'signup']).use(throttleSignUp)
    router.post('/verify', [AuthenticationController, 'verifyEmail'])
    router.post('/refresh', [AuthenticationController, 'refresh'])
    router.post('/reset-password', [AuthenticationController, 'sendResetPasswordEmail'])
    router.post('/verify-reset-password', [AuthenticationController, 'verifyResetPassword'])
    router.get('/qr-code', [AuthenticationController, 'generateQRCodeToken'])
    router
      .group(() => {
        router.post('/qr-code/:token', [AuthenticationController, 'validateQRCodeToken'])
        router.post('/totp', [AuthenticationController, 'generateTOTPToken'])
        router.patch('/password', [AuthenticationController, 'updatePassword'])
        router.post('/send-email', [AuthenticationController, 'sendEmail'])
        router.post('/logout', [AuthenticationController, 'logout'])
        router.post('/totp/complete', [AuthenticationController, 'finalize2FA'])
        router.post('/totp/disable', [AuthenticationController, 'disable2FA'])
      })
      .use(middleware.auth())
  })
  .prefix('authentication')
