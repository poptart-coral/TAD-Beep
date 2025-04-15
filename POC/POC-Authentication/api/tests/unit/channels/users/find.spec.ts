import ChannelNotFoundException from '#apps/channels/exceptions/channel_not_found_exception'
import ChannelService from '#apps/channels/services/channel_service'
import UserNotFoundException from '#apps/users/exceptions/user_not_found_exception'
import { ChannelFactory } from '#database/factories/channel_factory'
import { UserFactory } from '#database/factories/user_factory'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const channelService = await app.container.make(ChannelService)

test.group('Channels users find', () => {
  test('must find a channel from user ids', async ({ assert }) => {
    const users = await UserFactory.createMany(2)
    const channel = await ChannelFactory.merge({ name: `${users[0].id}, ${users[1].id}` })
      .apply('private_channel')
      .create()
    await channel.related('users').attach([users[0].id, users[1].id])
    const foundChannel = await channelService.findFromUsersOrFail([users[1].id, users[0].id])
    assert.equal(foundChannel?.id, channel.id)
  })
  test('must return 404 if one user does not exist', async ({ assert }) => {
    const users = await UserFactory.createMany(1)
    const nonExistentUserId = '9999'
    let errorThrown = new UserNotFoundException()
    await channelService
      .findFromUsersOrFail([users[0].id, nonExistentUserId])
      .catch((error: UserNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_ROW_NOT_FOUND',
      status: 404,
      message: 'Users not found',
    })
  })

  test('must return 404 if the channel does not exist', async ({ assert }) => {
    const users = await UserFactory.createMany(2)
    let errorThrown = new ChannelNotFoundException()
    await channelService
      .findFromUsersOrFail([users[0].id, users[1].id])
      .catch((error: ChannelNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_ROW_NOT_FOUND',
      status: 404,
      message: 'Channel not found',
    })
  })
  test('must return the channel if users exist and are in the channel', async ({ assert }) => {
    const users = await UserFactory.createMany(2)
    const channel = await ChannelFactory.merge({ name: `${users[0].id}, ${users[1].id}` })
      .apply('private_channel')
      .create()
    await channel.related('users').attach([users[0].id, users[1].id])
    const foundChannel = await channelService.findFromUsers([users[0].id, users[1].id])
    assert.equal(foundChannel?.id, channel.id)
  })

  test('must return null if users exist but the channel is not created', async ({ assert }) => {
    const users = await UserFactory.createMany(2)
    const foundChannel = await channelService.findFromUsers([users[0].id, users[1].id])
    assert.isNull(foundChannel)
  })

  test('must return null if users do not exist', async ({ assert }) => {
    const nonExistentUserIds = ['9999', '8888']
    const foundChannel = await channelService.findFromUsers(nonExistentUserIds)
    assert.isNull(foundChannel)
  })

  test('must return a channel if the user is in a channel and the channel exists', async ({
    assert,
  }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.merge({ name: `${user.id}` })
      .apply('private_channel')
      .createMany(3)
    for (const c of channel) {
      await c.related('users').attach([user.id])
    }
    const foundChannels = await channelService.findPrivateByUser(user.id)
    assert.isNotNull(foundChannels)
    assert.isArray(foundChannels)
    assert.lengthOf(foundChannels!, 3)
  })

  test('must return null if the user does not exist', async ({ assert }) => {
    const nonExistentUserId = '9999'
    const foundChannels = await channelService.findPrivateByUser(nonExistentUserId)
    assert.isNull(foundChannels)
  })

  test('must return the channels of the user', async ({ assert }) => {
    const user = await UserFactory.create()
    const channels = await ChannelFactory.merge({ name: `${user.id}` })
      .apply('private_channel')
      .createMany(3)
    for (const channel of channels) {
      await channel.related('users').attach([user.id])
    }
    const foundChannels = await channelService.findPrivateByUserOrFail(user.id)
    assert.isNotNull(foundChannels)
    assert.isArray(foundChannels)
    assert.lengthOf(foundChannels, 3)
  })

  test('must return 404 if the user does not exist when finding channels', async ({ assert }) => {
    const nonExistentUserId = '9999'
    let errorThrown = new UserNotFoundException()
    await channelService
      .findPrivateByUserOrFail(nonExistentUserId)
      .catch((error: UserNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_ROW_NOT_FOUND',
      status: 404,
      message: 'User not found',
    })
  })

  test('must return channels ordered by the last message sent in each channel', async ({
    assert,
  }) => {
    const user = await UserFactory.create()
    const channels = await ChannelFactory.merge({ name: `${user.id}` })
      .apply('private_channel')
      .createMany(3)
    for (const channel of channels) {
      await channel.related('users').attach([user.id])
    }
    await channels[1].related('messages').create({ content: 'First message' })
    await channels[0].related('messages').create({ content: 'First message' })
    await channels[2].related('messages').create({ content: 'First message' })
    await channels[1].related('messages').create({ content: 'Second message' })
    const foundChannels = await channelService.findPrivateOrderedForUserOrFail(user.id)
    assert.isNotNull(foundChannels)
    assert.isArray(foundChannels)
    assert.lengthOf(foundChannels, 3)
    assert.equal(foundChannels[0].id, channels[1].id)
    assert.equal(foundChannels[1].id, channels[2].id)
    assert.equal(foundChannels[2].id, channels[0].id)
  })

  test('must return 404 if the user does not exist when ordering channels', async ({ assert }) => {
    const nonExistentUserId = '9999'
    let errorThrown = new UserNotFoundException()
    await channelService
      .findPrivateOrderedForUserOrFail(nonExistentUserId)
      .catch((error: UserNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_ROW_NOT_FOUND',
      status: 404,
      message: 'User not found',
    })
  })

  test('must return the other user entity with channels', async ({ assert }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()
    const channel = await ChannelFactory.merge({ name: `${user.id}, ${otherUser.id}` })
      .apply('private_channel')
      .create()
    await channel.related('users').attach([user.id, otherUser.id])
    const foundChannels = await channelService.findPrivateOrderedForUserOrFail(user.id)
    assert.isNotNull(foundChannels)
    assert.isArray(foundChannels)
    assert.lengthOf(foundChannels, 1)
    assert.equal(foundChannels[0].id, channel.id)
    assert.equal(foundChannels[0].users[0].id, otherUser.id)
  })
})
