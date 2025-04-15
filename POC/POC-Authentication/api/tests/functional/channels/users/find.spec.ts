import { ChannelFactory } from '#database/factories/channel_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Channels users find', () => {
  test('must return a 200 and channels of the user connected', async ({ client }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.apply('private_channel').create()
    await channel.related('users').attach([user.id])
    const response = await client.get('/v1/users/@me/channels').loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains([{ id: channel.id }])
  })
})
