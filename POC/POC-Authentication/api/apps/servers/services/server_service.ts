import Member from '#apps/members/models/member'
import Server from '#apps/servers/models/server'
import { generateSnowflake } from '#apps/shared/services/snowflake'
import StorageService from '#apps/storage/services/storage_service'
import User from '#apps/users/models/user'
import { inject } from '@adonisjs/core'
import ServerAlreadyExistsException from '../exceptions/server_already_exists_exception.js'
import ServerCountLimitReachedException from '../exceptions/server_count_limit_reached_exception.js'
import { CreateServerSchema, UpdateBannerSchema, UpdateServerSchema } from '../validators/server.js'
import Role from '#apps/roles/models/role'
import { DEFAULT_ROLE_SERVER } from '#apps/shared/constants/default_role_server'
import { DEFAULT_ROLE_SERVER_PERMISSION } from '#apps/shared/constants/default_role_permission'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class ServerService {
  constructor(private storageService: StorageService) {}

  async findAll(page: number = 1, limit: number = 10): Promise<Server[]> {
    const pageServers = await Server.query().paginate(page, limit)
    return pageServers.all()
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<Server[]> {
    const pageServers = await Server.query()
      .whereHas('users', (builder) => {
        builder.where('id', userId)
      })
      .paginate(page, limit)
    return pageServers.all()
  }

  async findByChannelId(channelId: string): Promise<Server> {
    const server = await Server.query()
      .whereHas('channels', (builder) => {
        builder.where('id', channelId)
      })
      .firstOrFail()
    return server
  }

  async findById(serverId: string): Promise<Server> {
    return Server.findOrFail(serverId)
  }

  async create(
    { name, description, visibility, icon }: CreateServerSchema,
    ownerId: string
  ): Promise<Server> {
    const checkIfServerExists = await Server.query().where('name', name).first()
    if (checkIfServerExists) {
      throw new ServerAlreadyExistsException('Server already exists', {
        status: 400,
        code: 'E_SERVER_ALREADY_EXISTS',
      })
    }

    const user = await User.findOrFail(ownerId)

    // check if user already has 100 servers or more as the owner (owner_id in servers table)
    const userServers = await this.findByUserId(ownerId, 1, 51)
    if (userServers.length >= 50) {
      throw new ServerCountLimitReachedException('User has reached the limit of servers', {
        status: 400,
        code: 'E_SERVER_COUNT_LIMIT_REACHED',
      })
    }

    const sn = generateSnowflake()
    let server = new Server()
    let member = new Member()
    let role = new Role()

    await db.transaction(async (trx) => {
      server.useTransaction(trx)
      member.useTransaction(trx)
      role.useTransaction(trx)

      server = await Server.create(
        {
          banner: '',
          icon: '',
          name: name,
          description: description ?? '',
          visibility: visibility as 'public' | 'private',
          ownerId: ownerId,
          serialNumber: sn,
        },
        { client: trx }
      )

      member = await Member.create(
        {
          avatar: user.profilePicture,
          nickname: user.username,
          serverId: server.id,
          userId: ownerId,
        },
        { client: trx }
      )

      role = await Role.create(
        {
          id: server.id,
          name: DEFAULT_ROLE_SERVER,
          permissions: DEFAULT_ROLE_SERVER_PERMISSION,
          serverId: server.id,
        },
        { client: trx }
      )
    })

    let path: string | null = null

    if (icon) {
      path = await this.storageService.updatePicture(icon, server.id)
      server.icon = path
    }

    return server.save()
  }

  async getOwner(serverId: string): Promise<string> {
    const server = await Server.findOrFail(serverId)
    return server.ownerId
  }

  async findUsersByServerId(serverId: string): Promise<User[]> {
    const server = await Server.query().where('id', serverId).preload('users').firstOrFail()
    return server.users
  }

  async update(serverId: string, payload: UpdateServerSchema): Promise<Server> {
    const server = await Server.findOrFail(serverId)
    server.merge(payload)
    await server.save()
    return server
  }

  async delete(serverId: string): Promise<void> {
    const server: Server = await Server.findOrFail(serverId)
    await server.delete()
  }

  // banner

  async updateBanner(payload: UpdateBannerSchema): Promise<void> {
    const server = await Server.findOrFail(payload.params.serverId)
    server.banner = await new StorageService().updateBanner(payload.attachment, server.id)
    await server.save()
  }

  // picture

  async updatePicture(payload: UpdateBannerSchema): Promise<void> {
    const server = await Server.findOrFail(payload.params.serverId)
    server.icon = await new StorageService().updatePicture(payload.attachment, server.id)
    await server.save()
  }

  async discover(page: number = 1, limit: number = 10): Promise<Server[]> {
    const pageServers = await Server.query().where('visibility', 'public').paginate(page, limit)
    return pageServers.all()
  }

  async discoverAndSearch(search: string, page: number = 1, limit: number = 10): Promise<Server[]> {
    const pageServers = await Server.query()
      .where('visibility', 'public')
      .where('name', 'ilike', `%${search}%`)
      .paginate(page, limit)
    return pageServers.all()
  }

  async userPartOfServer(userId: string, serverId: string): Promise<boolean> {
    const server = await this.findById(serverId)
    await server.load('members')
    const isMember = server.members.some((m) => m.userId === userId)
    return isMember
  }

  async getByUserId(userId: string): Promise<Server[]> {
    return Server.query().whereHas('members', (builder) => {
      builder.where('user_id', userId)
    })
  }

  async getMember(serverId: string, userId: string) {
    const server = await this.findById(serverId)
    await server.load('members', (query) => {
      query.where('user_id', userId).preload('roles')
    })

    return server.members[0]
  }

  async findOwner(serverId: string): Promise<string> {
    const server = await Server.findOrFail(serverId)
    return server.ownerId
  }
}
