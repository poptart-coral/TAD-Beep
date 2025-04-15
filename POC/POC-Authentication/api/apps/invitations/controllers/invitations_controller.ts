import { Payload } from '#apps/authentication/contracts/payload'
import InvitationService from '#apps/invitations/services/invitation_service'
import {
  answerInvitationValidator,
  createFriendInvitationValidator,
} from '#apps/invitations/validators/invitation'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { InvitationStatus } from '#apps/invitations/models/status'
import InvitationPolicy from '#apps/invitations/policies/invitation_policy'
import emitter from '@adonisjs/core/services/emitter'

@inject()
export default class InvitationsController {
  constructor(private invitationService: InvitationService) {}

  public async create({ request, auth, response }: HttpContext) {
    const userPayload = auth.user as Payload
    const req = await request.validateUsing(createFriendInvitationValidator)
    const invitation = await this.invitationService.createFriend(userPayload.sub, req)

    const event = {
      receiverId: invitation.targetId as string,
      senderName: userPayload.username,
    }

    // emit the event
    await emitter.emit('friend:request', event)

    return response.created(invitation)
  }

  public async answerInvitation({ bouncer, request, response, params }: HttpContext) {
    const invitationId = params.invitationId
    await bouncer.with(InvitationPolicy).authorize('answer' as never, invitationId)
    const req = await request.validateUsing(answerInvitationValidator)
    await this.invitationService.answerFriendInvitation(invitationId, req)
    if (req.answer === InvitationStatus.Accepted)
      return response.ok({ message: 'Invitation accepted' })
    else return response.ok({ message: 'Invitation declined' })
  }
}
