import { ResourceAccess } from './jwt.js'

export interface Payload {
  sub: string
  exp: number
  firstName: string
  lastNamese: string
  resource_access: ResourceAccess
  username: string
  email: string
  audited_account: boolean
}
