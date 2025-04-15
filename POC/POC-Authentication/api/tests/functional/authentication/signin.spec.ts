// import User from '#apps/users/models/user'
import { UserFactoryWithPassord, UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Authentication signin', () => {
  test('Must return 200 when user signin with email/password', async ({ client, expect }) => {
    const password = 'password123'
    const user = await UserFactoryWithPassord(password).create()

    const payload = {
      email: user.email,
      password: password,
    }

    const result = await client.post('/authentication/signin').json(payload)

    result.assertStatus(200)
    expect(result.body()).toHaveProperty('user')
    expect(result.body()).toHaveProperty('tokens')
    expect(result.body().tokens).toHaveProperty('accessToken')
    expect(result.body().tokens).toHaveProperty('refreshToken')
  }).tags(['authentication:signin'])

  test('Must return 400 when user signin with wrong email/password pair', async ({ client }) => {
    const user = await UserFactory.make()
    const payload = {
      email: user.email,
      password: 'wrongpassword',
    }
    const result = await client.post('/authentication/signin').json(payload)
    result.assertStatus(400)
  }).tags(['authentication:signin'])

  test('Must return 403 when trying to signing without a right token and passKey', async ({
    client,
  }) => {
    const payload = {
      token: 'wrongtoken',
      passKey: 'wrongPassKey',
    }
    const result = await client.post('/authentication/signin').json(payload)

    result.assertStatus(403)
  }).tags(['authentication:signin'])
})
