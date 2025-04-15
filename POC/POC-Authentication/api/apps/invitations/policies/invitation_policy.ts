import { BasePolicy } from '@adonisjs/bouncer'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Invitation from '#apps/invitations/models/invitation'
import UnusableInvitationException from '../exceptions/unusable_invitation_exception.js'
import { JwtPayload } from 'jsonwebtoken'

@inject()
export default class InvitationPolicy extends BasePolicy {
  constructor(protected ctx: HttpContext) {
    super()
  }

  async answer(user: JwtPayload, invitationId: string) {
    const invitation = await Invitation.findOrFail(invitationId).catch(() => {
      throw new UnusableInvitationException('Invitation not found', {
        code: 'E_INVITATION_NOT_FOUND',
        status: 404,
      })
    })

    return invitation.targetId === user.sub || invitation.creatorId === user.sub
  }
}
