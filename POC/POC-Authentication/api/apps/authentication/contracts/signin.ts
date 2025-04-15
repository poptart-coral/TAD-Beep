import User from '#apps/users/models/user'

export interface SignIn {
  user: User
  tokens: {
    accessToken: string
    refreshToken: string
  }
}
