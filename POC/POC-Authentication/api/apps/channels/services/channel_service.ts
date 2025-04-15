import ChannelNotFoundException from '#apps/channels/exceptions/channel_not_found_exception'
import Channel from '#apps/channels/models/channel'
import { ChannelType, channelTypeToString } from '#apps/channels/models/channel_type'
import { CachedUser, OccupiedChannel } from '#apps/channels/models/occupied_channels'
import {
  CreateChannelSchema,
  SubscribeChannelSchema,
  UpdateChannelSchema,
} from '#apps/channels/validators/channel'
import Message from '#apps/messages/models/message'
import ServerNotFoundException from '#apps/servers/exceptions/server_not_found_exception'
import Server from '#apps/servers/models/server'
import { generateSnowflake } from '#apps/shared/services/snowflake'
import UserNotFoundException from '#apps/users/exceptions/user_not_found_exception'
import User from '#apps/users/models/user'
import UserService from '#apps/users/services/user_service'
import env from '#start/env'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import redis from '@adonisjs/redis/services/main'
import transmit from '@adonisjs/transmit/services/main'
import jwt from 'jsonwebtoken'
import ChannelWithIncoherentHierarchyException from '../exceptions/channel_cant_be_children_exception.js'
import { Payload } from '#apps/authentication/contracts/payload'

export interface PayloadJWTSFUConnection {
  serverId?: string
}

@inject()
export default class ChannelService {
  constructor(private userService: UserService) {}

  async findByIdOrFail(channelId: string): Promise<Channel> {
    const channel = await Channel.query()
      .where('id', channelId)
      .firstOrFail()
      .catch(() => {
        throw new ChannelNotFoundException('Channel not found', {
          status: 404,
          code: 'E_ROW_NOT_FOUND',
        })
      })
    return channel
  }

  async findAllByServer(serverId: string): Promise<Channel[]> {
    const server = await Server.findOrFail(serverId).catch(() => {
      throw new ServerNotFoundException('Server not found', {
        status: 404,
        code: 'E_ROW_NOT_FOUND',
      })
    })
    await server.load('channels')
    return server.channels
  }

  async findAllChannelsByServerWithChildren(serverId: string): Promise<Channel[]> {
    const channels = await Channel.query()
      .whereNull('parentId')
      .where('serverId', serverId)
      .preload('childrens')
    return channels
  }

  async findPrivateOrderedForUserOrFail(userId: string): Promise<Channel[]> {
    await User.findOrFail(userId).catch(() => {
      throw new UserNotFoundException('User not found', { status: 404, code: 'E_ROW_NOT_FOUND' })
    })

    const messageSubquery = Message.query()
      .select('createdAt')
      .whereColumn('messages.channel_id', 'channels.id')
      .orderBy('createdAt', 'desc')
      .limit(1)

    const channels = await Channel.query()
      .whereHas('users', (builder) => {
        builder.where('user_id', userId)
      })
      .orderByRaw(`(${messageSubquery.toQuery()}) DESC NULLS LAST`)
      .where('type', ChannelType.PRIVATE_CHAT)
      .orderBy(messageSubquery, 'desc')
      .preload('users', (builder) => {
        builder.select('id', 'username', 'profilePicture').whereNot('id', userId)
      })
    return channels
  }

  async findPrivateByUser(userId: string): Promise<Channel[] | null> {
    const user = await User.find(userId)
    if (!user) return null
    return Channel.query()
      .whereHas('users', (builder) => {
        builder.where('user_id', userId)
      })
      .where('type', ChannelType.PRIVATE_CHAT)
  }

  async findPrivateByUserOrFail(userId: string): Promise<Channel[]> {
    await User.findOrFail(userId).catch(() => {
      throw new UserNotFoundException('User not found', { status: 404, code: 'E_ROW_NOT_FOUND' })
    })

    const channels = await this.findPrivateByUser(userId)
    if (!channels) {
      throw new ChannelNotFoundException('Channel not found', {
        status: 404,
        code: 'E_ROW_NOT_FOUND',
      })
    }
    return channels
  }

  async findFromUsersOrFail(userIds: string[]): Promise<Channel> {
    const users = await User.findMany(userIds)
    if (users.length !== userIds.length) {
      throw new UserNotFoundException('Users not found', {
        status: 404,
        code: 'E_ROW_NOT_FOUND',
      })
    }

    const channel = await this.findFromUsers(userIds)
    if (!channel) {
      throw new ChannelNotFoundException('Channel not found', {
        status: 404,
        code: 'E_ROW_NOT_FOUND',
      })
    }

    return channel
  }

  /**
   * Finds a channel that includes all and only the specified users.
   *
   * @param userIds - An array of user IDs to search for in the channel.
   * @returns A promise that resolves to the channel if found, or null if no such channel exists.
   *
   * The method queries the database for a channel that:
   * - Does not have the type 'text_server' or 'voice_server'.
   * - Contains all the specified users.
   * - Does not contain any users other than the specified ones.
   */
  async findFromUsers(userIds: string[]): Promise<Channel | null> {
    const channel = await Channel.query()
      .whereNot('type', ChannelType.TEXT_SERVER)
      .whereNot('type', ChannelType.VOICE_SERVER)
      .whereHas('users', (builder) => {
        builder.whereIn('user_id', userIds)
      })
      .whereIn('id', (subquery) => {
        subquery
          .from('channels_users')
          .select('channel_id')
          .groupBy('channel_id')
          .havingRaw('COUNT(*) = ?', [userIds.length])
      })
      .whereDoesntHave('users', (builder) => {
        builder.whereNotIn('user_id', userIds)
      })
      .first()
    return channel
  }

  async create(
    newChannel: CreateChannelSchema,
    serverId: string,
    userId: string
  ): Promise<Channel> {
    const type = newChannel.type as ChannelType
    if (newChannel.parentId) {
      if (type === ChannelType.PRIVATE_CHAT || type === ChannelType.FOLDER_SERVER) {
        throw new ChannelWithIncoherentHierarchyException(
          `Channel with type ${channelTypeToString(type)} can't have a parent channel`,
          {
            status: 422,
            code: 'E_WRONG_HIERARCHY',
          }
        )
      }

      let parent: Channel
      try {
        parent = await Channel.findOrFail(newChannel.parentId)
      } catch (e) {
        logger.error(e)
        throw new ChannelNotFoundException('Parent channel not found', {
          status: 404,
          code: 'E_ROWNOTFOUND',
        })
      }

      if ((parent.type as ChannelType) !== ChannelType.FOLDER_SERVER) {
        throw new ChannelWithIncoherentHierarchyException(
          `Parent channel is not of type FOLDER_SERVER`,
          {
            status: 422,
            code: 'E_WRONG_HIERARCHY',
          }
        )
      }
    }

    const sn = generateSnowflake()
    const firstChannel = await Channel.query()
      .where('server_id', serverId)
      .orderBy('position')
      .first()
    const position = firstChannel != null ? firstChannel.position - 1 : 0

    const channel = newChannel.parentId
      ? await Channel.create({
          name: newChannel.name,
          type: type,
          serverId: serverId,
          serialNumber: sn,
          position,
          parentId: newChannel.parentId,
        })
      : await Channel.create({
          name: newChannel.name,
          type: type,
          serverId: serverId,
          serialNumber: sn,
          position,
        })
    logger.info('Created new channel : ', channel)
    await channel.related('users').attach([userId])
    return channel
  }

  async update(id: string, payload: UpdateChannelSchema): Promise<Channel> {
    const channel = await Channel.findOrFail(id).catch(() => {
      throw new ChannelNotFoundException('Channel not found', {
        status: 404,
        code: 'E_ROWNOTFOUND',
      })
    })
    logger.info('Updating channel : ', payload)
    channel.merge(payload)
    logger.info(channel.toJSON())
    await redis.del(`channel:${id}`)
    return channel.save()
  }

  async deleteById(channelId: string): Promise<void> {
    const channel: Channel = await Channel.findOrFail(channelId)
    await channel.delete()
  }

  async join(userId: string, channelId: string) {
    const channel = await Channel.findOrFail(channelId)
    await channel.related('users').attach([userId])
    return channel
  }

  async leave(userId: string, channelData: SubscribeChannelSchema) {
    const channel = await Channel.findOrFail(channelData.params.id)
    await channel.related('users').detach([userId])
    return channel
  }

  async occupiedVoiceChannels(serverId: string) {
    //recuperer tous les channels presents dans le server en parametre
    //on parcourt chaque channel et on recupere les users presents dans chaque channel
    const occupiedChannels: OccupiedChannel[] = []
    const channelIds = await redis.keys(`server:${serverId}:channel:*`)

    for (const channel of channelIds) {
      const channelData = await redis.hgetall(channel)
      const users: CachedUser[] = []
      for (const userId in channelData) {
        const username = channelData[userId]
        let payload = await redis.hget(`users:${serverId}`, userId)
        if (!payload) {
          payload = '{"muted": false, "voiceMuted": false, "camera": false}'
        }
        try {
          const mutedState = JSON.parse(payload)
          const user: CachedUser = {
            id: userId,
            username: username,
            muted: mutedState.muted,
            voiceMuted: mutedState.voiceMuted,
            userSn: await this.userService.getSn(userId),
            camera: mutedState.camera,
          }
          users.push(user)
        } catch (e) {
          logger.error(e)
        }
      }
      const occupiedChannel = { channelId: channel.split(':')[3], users: users }
      occupiedChannels.push(occupiedChannel)
    }
    return occupiedChannels
  }

  async joinVoiceChannel(userPayload: Payload): Promise<string> {
    try {
      const token = this.generateToken(userPayload)
      return token
    } catch {
      return ''
    }
  }

  async changeMutedStatus(
    userId: string,
    serverId: string,
    payload: { muted: boolean; voiceMuted: boolean; camera: boolean }
  ) {
    redis.hset(`users:${serverId}`, userId, JSON.stringify(payload))
    transmit.broadcast(`users/${serverId}/state`, { message: 'update muted' })
  }

  async quitVoiceChannel(userId: string): Promise<string> {
    // connaissant le channel surlequel se trouve le user on peut le retirer
    try {
      return userId
    } catch {
      return ''
    }
  }

  generateToken(payload: Payload): string {
    return jwt.sign(payload, env.get('APP_KEY'))
  }

  async isUserInChannel(channelId: string, userId: string): Promise<boolean> {
    const channel = await Channel.find(channelId)
    if (channel?.type != ChannelType.PRIVATE_CHAT) return false
    await channel.load('users')
    return channel.users.some((user) => user.id === userId)
  }
}
