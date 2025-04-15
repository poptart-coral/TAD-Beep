import Member from '#apps/members/models/member'
import Server from '#apps/servers/models/server'

export interface MemberServiceContract {
  create(serverId: string, userId: string): Promise<Member>
  addMemberRole(): Promise<void>
  removeMemberRole(): Promise<void>
  removeServerMember(): Promise<void>
  findAllByServerId(serverId: string): Promise<Member[]>
  getServersByUserId(userId: string): Promise<Server[]>
  getMemberByUserIdAndServerId(userId: string, serverId: string): Promise<Member>
}
