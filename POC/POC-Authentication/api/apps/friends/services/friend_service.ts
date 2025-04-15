import Friend from '#apps/friends/models/friend'
import UserNotFoundException from '#apps/users/exceptions/user_not_found_exception'
import User from '#apps/users/models/user'
import { inject } from '@adonisjs/core'
import AlreadyFriendsException from '#apps/friends/exceptions/already_friends_exception'
import FriendshipNotFoundException from '#apps/friends/exceptions/friendship_not_found_exception'
import Channel from '#apps/channels/models/channel'
import { ChannelType } from '#apps/channels/models/channel_type'
import ChannelService from '#apps/channels/services/channel_service'

@inject()
export default class FriendService {
  constructor(readonly channelService: ChannelService) {}
  async deleteFriendship(userId: string, friendId: string): Promise<void> {
    const friendship = await this.findFriendshipOrFail(userId, friendId)
    await friendship.delete()
  }

  async createFriendship(userId: string, friendId: string): Promise<Friend> {
    await User.findOrFail(userId).catch(() => {
      throw new UserNotFoundException('User not found', { code: 'E_USER_NOT_FOUND', status: 404 })
    })
    await User.findOrFail(friendId).catch(() => {
      throw new UserNotFoundException('User not found', { code: 'E_USER_NOT_FOUND', status: 404 })
    })

    // Check if the friendship already exists
    const friendship = await this.findFriendship(userId, friendId)
    if (friendship) {
      throw new AlreadyFriendsException('Already friends', {
        code: 'E_ALREADY_FRIENDS',
        status: 400,
      })
    }

    const friends = await Friend.create({ user_id: userId, friend_id: friendId })

    const channel = await this.channelService.findFromUsers([userId, friendId])
    if (!channel) {
      const channel = await Channel.create({
        name: `${userId}, ${friendId}`,
        type: ChannelType.PRIVATE_CHAT,
      })

      await channel.related('users').attach([userId, friendId])
    }
    return friends
  }

  async findByUser(userId: string): Promise<User[]> {
    const friendships = await Friend.query()
      .where('user_id', userId)
      .orWhere('friend_id', userId)
      .preload('user', (query) => {
        query.whereNot('id', userId).select(['id', 'username', 'profile_picture'])
      })
      .preload('friend', (query) => {
        query.whereNot('id', userId).select(['id', 'username', 'profile_picture'])
      })
    const friendsList = friendships.map((friendship) => {
      return friendship.user == undefined ? friendship.friend : friendship.user
    })
    return friendsList
  }

  async findFriendship(userId1: string, userId2: string): Promise<Friend | null> {
    return Friend.query()
      .where(async (query) => {
        await query.where('user_id', userId1).andWhere('friend_id', userId2)
      })
      .orWhere(async (query) => {
        await query.where('user_id', userId2).andWhere('friend_id', userId1)
      })
      .first()
  }
  async findFriendshipOrFail(userId1: string, userId2: string): Promise<Friend> {
    await User.findOrFail(userId1).catch(() => {
      throw new UserNotFoundException('User not found', { code: 'E_USER_NOT_FOUND', status: 404 })
    })
    await User.findOrFail(userId2).catch(() => {
      throw new UserNotFoundException('User not found', { code: 'E_USER_NOT_FOUND', status: 404 })
    })
    const friendship = await this.findFriendship(userId1, userId2)
    if (friendship) return friendship

    throw new FriendshipNotFoundException('Friendship not found', {
      code: 'E_FRIENDSHIP_NOT_FOUND',
      status: 404,
    })
  }
}
