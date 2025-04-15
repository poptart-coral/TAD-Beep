export type ResourceAccess = {
  roles: string[]
}

declare module '@japa/api-client' {
  interface ApiRequest {
    loginAs(user: unknown, realmRoles: string[]): this
  }
}
