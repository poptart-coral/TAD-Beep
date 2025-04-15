import Server from '#apps/servers/models/server'
import { DEFAULT_ROLE_SERVER_PERMISSION } from '#apps/shared/constants/default_role_permission'
import { DEFAULT_ROLE_SERVER } from '#apps/shared/constants/default_role_server'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const servers = await Server.query()
    await Promise.all(
      servers.map(async (server) => {
        await server.related('roles').firstOrCreate(
          { id: server.id },
          {
            id: server.id,
            name: DEFAULT_ROLE_SERVER,
            permissions: DEFAULT_ROLE_SERVER_PERMISSION,
          }
        )
      })
    )
  }
}
