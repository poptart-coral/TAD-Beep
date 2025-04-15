import Invitation from '#apps/invitations/models/invitation'
import { InvitationStatus } from '#apps/invitations/models/status'
import { InvitationType } from '#apps/invitations/models/type'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
export const InvitationFactory = factory
  .define(Invitation, async () => {
    const user = await UserFactory.create()
    return Invitation.create({
      creatorId: user.id,
      type: InvitationType.SERVER,
    })
  })
  .state('expiration', (invitation) => (invitation.expiration = DateTime.now().plus({ days: 1 })))
  .state('unique', (invitation) => (invitation.status = InvitationStatus.Pending))
  .state(
    'friend',
    (invitation) => (
      (invitation.type = InvitationType.FRIEND), (invitation.status = InvitationStatus.Pending)
    )
  )
  .relation('server', () => ServerFactory)
  .relation('target', () => UserFactory)
  .after('create', (_invitationFactory, invitationModel) => {
    delete invitationModel.$preloaded['target']
  })
  .build()
