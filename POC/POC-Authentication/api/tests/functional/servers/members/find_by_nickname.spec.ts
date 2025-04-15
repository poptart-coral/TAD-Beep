import { MemberFactory } from '#database/factories/member_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { test } from '@japa/runner'

test.group('Servers members find by nickname', () => {
  test('must return 200 and the members matching the nickname', async ({ assert, client }) => {
    const server = await ServerFactory.create()
    const members = await MemberFactory.merge({
      serverId: server.id,
      nickname: 'jondoe',
    }).createMany(3)
    await members[0].load('user')
    const result = await client
      .get(`/v1/servers/${server.id}/members?nickname_starts_with=jond`)
      .loginAs(members[0].user)
    assert.equal(result.status(), 200)
    assert.equal(result.body().length, 3)
    assert.containsSubset(
      result.body(),
      members.map((member) => {
        return { id: member.id }
      })
    )
  })
  test('must return 401 if the user is not authenticated', async ({ assert, client }) => {
    const server = await ServerFactory.create()
    await MemberFactory.merge({ serverId: server.id, nickname: 'jondoe' }).createMany(3)
    const result = await client.get(`/v1/servers/${server.id}/members?nickname_starts_with=jond`)
    assert.equal(result.status(), 401)
  })
})
