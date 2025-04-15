import { Payload } from '#apps/authentication/contracts/payload'
import InvitationService from '#apps/invitations/services/invitation_service'
import { createServerInvitationValidator } from '#apps/invitations/validators/invitation'
import ServerInvitationPolicy from '#apps/servers/policies/server_invitation_policy'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ServerInvitationsController {
  constructor(private invitationService: InvitationService) {}
  async createInvitation({ auth, request, params, response, bouncer }: HttpContext) {
    const receivedInvitation = await request.validateUsing(createServerInvitationValidator)
    const userPayload = auth.user as Payload
    const serverId = params.serverId
    await bouncer.with(ServerInvitationPolicy).authorize('create' as never, serverId)
    const invitation = await this.invitationService.createForServer(
      receivedInvitation,
      userPayload.sub,
      serverId
    )
    return response.created(invitation)
  }
}
