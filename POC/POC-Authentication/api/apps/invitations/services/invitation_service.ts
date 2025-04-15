import Friend from '#apps/friends/models/friend'
import FriendService from '#apps/friends/services/friend_service'
import WrongInvitationFormatException from '#apps/invitations/exceptions/wrong_invitation_format_exception'
import Invitation from '#apps/invitations/models/invitation'
import { InvitationStatus } from '#apps/invitations/models/status'
import { InvitationType } from '#apps/invitations/models/type'
import {
  AnswerInvitationSchema,
  CreateFriendInvitationsSchema,
  CreateServerInvitationsSchema,
} from '#apps/invitations/validators/invitation'
import ServerNotFoundException from '#apps/servers/exceptions/server_not_found_exception'
import Server from '#apps/servers/models/server'
import UserNotFoundException from '#apps/users/exceptions/user_not_found_exception'
import User from '#apps/users/models/user'
import { DateTime } from 'luxon'
import UnusableInvitationException from '#apps/invitations/exceptions/unusable_invitation_exception'
import { inject } from '@adonisjs/core'

@inject()
export default class InvitationService {
  constructor(public friendService: FriendService) {}
  /**
   * Create a new invitation.
   */
  async createForServer(
    { expiration, isUnique }: CreateServerInvitationsSchema,
    creatorId: string,
    serverId: string
  ): Promise<Invitation> {
    await User.findOrFail(creatorId).catch(() => {
      throw new UserNotFoundException('User not found', { code: 'E_USER_NOT_FOUND', status: 404 })
    })
    const invitation = new Invitation()
    invitation.creatorId = creatorId

    const server = await Server.findOrFail(serverId).catch(() => {
      throw new ServerNotFoundException('Server not found', {
        code: 'E_SERVER_NOT_FOUND',
        status: 404,
      })
    })
    if (server.visibility === 'public') {
      throw new WrongInvitationFormatException('Public server cannot have invitation', {
        code: 'E_WRONG_INVITATION_FORMAT',
        status: 400,
      })
    }
    invitation.serverId = serverId
    invitation.type = InvitationType.SERVER
    invitation.expiration = DateTime.fromJSDate(expiration)
    if (isUnique) invitation.status = InvitationStatus.Pending

    return invitation.save()
  }

  async createFriend(
    creatorId: string,
    { targetId, targetUsername }: CreateFriendInvitationsSchema
  ): Promise<Invitation> {
    let friendId = targetId ?? ''
    if (targetId === undefined) {
      const target = await User.findByOrFail('username', targetUsername).catch(() => {
        throw new UserNotFoundException('Target not found', {
          code: 'E_ROW_NOT_FOUND',
          status: 404,
        })
      })
      friendId = target.id
    }

    await User.findOrFail(creatorId).catch(() => {
      throw new UserNotFoundException('Creator not found', { code: 'E_ROW_NOT_FOUND', status: 404 })
    })

    await User.findOrFail(friendId).catch(() => {
      throw new UserNotFoundException('Target not found', { code: 'E_ROW_NOT_FOUND', status: 404 })
    })

    const friendship = await Friend.query()
      .where(async (query) => {
        await query.where('user_id', creatorId).andWhere('friend_id', friendId)
      })
      .orWhere(async (query) => {
        await query.where('user_id', friendId).andWhere('friend_id', creatorId)
      })
      .first()
    if (friendship || creatorId === friendId) {
      throw new WrongInvitationFormatException("Friendship already exists or can't be created", {
        code: 'E_WRONG_INVITATION_FORMAT',
        status: 400,
      })
    }

    const existantInvitation = await Invitation.query()

      .where((query) => {
        query
          .where('status', InvitationStatus.Pending)
          .where('type', InvitationType.FRIEND)
          .where('target_id', creatorId)
          .where('creator_id', friendId)
      })
      .orWhere((query) => {
        query
          .where('status', InvitationStatus.Pending)
          .where('type', InvitationType.FRIEND)
          .where('target_id', friendId)
          .where('creator_id', creatorId)
      })
      .first()

    if (existantInvitation) {
      throw new WrongInvitationFormatException('Invitation already exists', {
        code: 'E_WRONG_INVITATION_FORMAT',
        status: 400,
      })
    }

    const invitation = await Invitation.create({
      creatorId: creatorId,
      targetId: friendId,
      type: InvitationType.FRIEND,
      status: InvitationStatus.Pending,
    })

    return invitation
  }

  async answerFriendInvitation(
    invitationId: string,
    { answer }: AnswerInvitationSchema
  ): Promise<Invitation> {
    const invitation = await Invitation.findOrFail(invitationId).catch(() => {
      throw new UnusableInvitationException('Invitation not found', {
        code: 'E_ROW_NOT_FOUND',
        status: 404,
      })
    })
    if (invitation.type !== InvitationType.FRIEND) {
      throw new WrongInvitationFormatException('Wrong invitation type', {
        code: 'E_WRONG_INVITATION_FORMAT',
        status: 400,
      })
    }
    if (invitation.status !== InvitationStatus.Pending) {
      throw new UnusableInvitationException('Invitation already answered', {
        code: 'E_UNUSABLE_INVITATION',
        status: 400,
      })
    }
    if (!invitation.targetId) {
      throw new UnusableInvitationException('Target not found', {
        code: 'E_ROW_NOT_FOUND',
        status: 404,
      })
    }
    if (answer === InvitationStatus.Accepted)
      await this.friendService.createFriendship(invitation.creatorId, invitation.targetId)
    await invitation.merge({ status: answer }).save()
    return invitation
  }

  async getInvitationsForUser(userId: string): Promise<Invitation[]> {
    await User.findOrFail(userId).catch(() => {
      throw new UserNotFoundException('User not found', { code: 'E_ROW_NOT_FOUND', status: 404 })
    })
    const invitations = Invitation.query()
      .select('id', 'creator_id', 'target_id', 'type', 'status', 'created_at')
      .where((query) => {
        query.where('target_id', userId).orWhere('creator_id', userId)
      })
      .where('status', InvitationStatus.Pending)
      .where('type', InvitationType.FRIEND)
      .orderBy('created_at', 'desc')
      .preload('creator', (query) =>
        query.select('id', 'username', 'profilePicture').whereNot('id', userId)
      )
      .preload('target', (query) =>
        query.select('id', 'username', 'profilePicture').whereNot('id', userId)
      )
    return invitations
  }

  async findById(id: string): Promise<Invitation> {
    return Invitation.findOrFail(id)
  }
}
