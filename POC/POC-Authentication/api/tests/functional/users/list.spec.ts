import { test } from '@japa/runner'

test.group('Users list', () => {
  test('must return 401 if the user is not logged in', async ({ assert, client }) => {
    const response = await client.get('/v1/users')

    response.assertStatus(401)
    assert.properties(response.body(), ['message', 'code', 'status'])
    assert.equal(response.body().status, 401)
    assert.equal(response.body().code, 'E_UNAUTHORIZED_ACCESS')
  })
})
