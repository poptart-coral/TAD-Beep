import Server from '#apps/servers/models/server'
import ServerService from '#apps/servers/services/server_service'
import User from '#apps/users/models/user'
import app from '@adonisjs/core/services/app'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const serverService = await app.container.make(ServerService)

export default class extends BaseSeeder {
  static environment: string[] = ['development']
  async run() {
    //remove all servers before seeding
    await Server.query().delete()
    const admin = await User.findByOrFail('username', 'admin')
    await serverService.create(
      {
        name: 'Beep',
        description: 'Beep is a free and open-source voice chat application for everyone.',
        visibility: 'public',
      },
      admin.id
    )
  }
}
