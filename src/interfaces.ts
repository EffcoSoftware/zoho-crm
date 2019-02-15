export interface ITokenStore {
  accessToken: string
  expiry: number
  refreshToken: string
}

export interface ITokenGenerate {
  clientId: string
  clientSecret: string
  redirectUri: string
  grantToken: string
  location: string
}

export interface ITokenRefresh {
  clientId: string
  clientSecret: string
  refreshToken: string
  location: string
}

export interface IConfig {
  tokenStore: string
  clientId: string
  clientSecret: string
  grantToken: string
  location: string
  apiUrl: string
  maxRead: number
  maxReadById: number
  maxUpdate: number
}
