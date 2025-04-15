import Member from '#apps/members/models/member'
import User from '#apps/users/models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    const users = await User.query().preload('servers')

    for (const user of users) {
      for (const server of user.servers) {
        await Member.firstOrCreate(
          {
            userId: user.id,
            serverId: server.id,
          },
          {
            avatar: user.profilePicture,
            deaf: false,
            mute: false,
            nickname: user.username,
            pending: false,
            timedOutUntil: null,
            serverId: server.id,
            userId: user.id,
            joinedAt: DateTime.now(),
          }
        )
      }
    }
  }
}
