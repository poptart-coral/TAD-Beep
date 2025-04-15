import { Payload } from '#apps/authentication/contracts/payload'
import InvitationService from '#apps/invitations/services/invitation_service'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UsersInvitationsController {
  constructor(protected invitationService: InvitationService) {}

  async index({ auth }: HttpContext) {
    const userPayload = auth.user as Payload
    return this.invitationService.getInvitationsForUser(userPayload.sub)
  }
}
