import Token from '#apps/users/models/token'
import User from '#apps/users/models/user'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import AuthenticationService from './authentication_service.js'
import { inject } from '@adonisjs/core'
import { ResetPasswordValidator } from '#apps/authentication/validators/authentication'
import logger from '@adonisjs/core/services/logger'
import UserNotFoundException from '#apps/users/exceptions/user_not_found_exception'
@inject()
export default class MailService {
  constructor(private authenticationService: AuthenticationService) {}
  async sendMail(email: string, subject: string, htmlMessage: string) {
    const emailApp: string = env.get('SMTP_USERNAME')

    const logoUrl: string = 'https://beep.baptistebronsin.be/logo.png'
    const heightLogo: number = 100
    // Car l'image fait 400px par 400px, dans d'autres cas cette règle de mathématique est nécessaire
    const widthLogo: number = (heightLogo * 400) / 400

    const logoBody: string =
      "<img src='" +
      logoUrl +
      "' alt='Logo Beep' width='" +
      widthLogo +
      "' height='" +
      heightLogo +
      "'>"

    const emailBody: string =
      `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Beep</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #EEEEEE;">

                <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <!-- En-tête de l'email avec logo -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 20px;">
                                        ` +
      logoBody +
      `
                                    </td>
                                </tr>
                            </table>

                            <!-- Contenu principal de l'email -->
                            <table style="background: white; border-radius: 10px; max-width: 600px;" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding: 10px 20px;">
                                        ` +
      htmlMessage +
      `
                                    </td>
                                </tr>
                            </table>

                            <!-- Pied de page de l'email -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 20px;">
                                        <p>Un problème, une question ? Contactez-nous à <a href="mailto:` +
      emailApp +
      `">` +
      emailApp +
      `</a></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `

    try {
      await mail.send((message) => {
        message.to(email).from(emailApp, 'Beep').subject(subject).html(emailBody)
      })
    } catch {
      // TODO: handle error
    }
  }

  async sendSignUpMail(user: User) {
    const subject: string = 'Bienvenue sur Beep !'
    const verificationToken: Token = await this.authenticationService.createToken(user)

    const htmlMessage: string =
      "<p>Bonjour $_PRENOM_$,</p><p>Veuillez trouver ci-dessous un bouton pour faire vérifier votre compte :</p><div style='text-align: center; margin: 40px 0;'><a href='$_URL_TOKEN_$' style='background-color: #4a7ab4; padding: 10px; border-radius: 10px; margin: 0 auto; color: white; text-decoration: none;'>Vérifier mon compte</a></div><p>Ce bouton possède une durée de validité de <span style='font-weight: bold; text-decoration: underline;'>$_TEMPS_VALIDITE_TOKEN_$ heures</span> à compter de la réception de ce mail.</p><p>Si vous n'êtes pas l'auteur de cette demande, merci de ne pas tenir compte de ce message.</p>"
        .replace('$_PRENOM_$', user.firstName)
        .replace(
          '$_URL_TOKEN_$',
          `${env.get('FRONTEND_URL')}/authentication/verify/` + verificationToken.token
        )
        .replace('$_TEMPS_VALIDITE_TOKEN_$', '2')

    this.sendMail(user.email, subject, htmlMessage)
  }

  async sendResetPasswordMail(resetPasswordValidator: ResetPasswordValidator) {
    const subject: string = 'Réinitialisation de votre mot de passe'
    let user: User
    try {
      user = await User.findByOrFail('email', resetPasswordValidator.email)
    } catch (err) {
      logger.error(err)
      throw new UserNotFoundException('User not found', { status: 404 })
    }

    const verificationToken: Token = await this.authenticationService.createToken(user)

    const htmlMessage: string =
      "<p>Bonjour $_PRENOM_$,</p><p>Veuillez trouver ci-dessous un bouton pour réinitialiser votre mot de passe :</p><div style='text-align: center; margin: 40px 0;'><a href='$_URL_TOKEN_$' style='background-color: #4a7ab4; padding: 10px; border-radius: 10px; margin: 0 auto; color: white; text-decoration: none;'>Réinitialiser mon mot de passe</a></div><p>Ce bouton possède une durée de validité de <span style='font-weight: bold; text-decoration: underline;'>$_TEMPS_VALIDITE_TOKEN_$ heures</span> à compter de la réception de ce mail.</p><p>Si vous n'êtes pas l'auteur de cette demande, merci de ne pas tenir compte de ce message.</p>"
        .replace('$_PRENOM_$', user.firstName)
        .replace(
          '$_URL_TOKEN_$',
          `${env.get('FRONTEND_URL')}/authentication/reset-password/` + verificationToken.token
        )
        .replace('$_TEMPS_VALIDITE_TOKEN_$', '2')

    this.sendMail(user.email, subject, htmlMessage)
  }

  /**
   * Send email to update the email address with OTP
   * @param email - Recipient's email
   * @param otp - One-Time Password
   */
  public async sendEmailUpdateMail(email: string, otp: string): Promise<void> {
    const subject: string = 'Mise à jour de votre adresse mail'

    const htmlMessage: string = `
      <p>Bonjour,</p>
      <p>Veuillez trouver ci-dessous votre code de vérification pour mettre à jour votre adresse mail :</p>
      <div style='text-align: center; margin: 40px 0;'>
        <span style='font-size: 20px; font-weight: bold; color: #4a7ab4;'>${otp}</span>
      </div>
      <p>Ce code est valide pendant <span style='font-weight: bold; text-decoration: underline;'>5 minutes</span>.</p>
      <p>Si vous n'êtes pas l'auteur de cette demande, merci de ne pas tenir compte de ce message.</p>
    `

    await this.sendMail(email, subject, htmlMessage)
  }

  /**
   * Send email to confirm that a change (of the email) has been made
   * @param email - Recipient's email
   */
  public async sendChangeConfirmationMail(email: string): Promise<void> {
    const subject: string = 'Confirmation de changement'

    const htmlMessage: string = `
    <p>Bonjour,</p>
    <p>Nous vous confirmons que votre changement a été effectué avec succès.</p>
    <p>Si vous n'êtes pas à l'origine de cette modification, merci de nous contacter immédiatement.</p>
  `

    await this.sendMail(email, subject, htmlMessage)
  }
}
