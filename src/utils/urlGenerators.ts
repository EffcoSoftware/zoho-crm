import { ITokenGenerate, ITokenRefresh, IConfig } from '../interfaces'

export const getTokenGenerateUrl = (
  tokenGenerateData: ITokenGenerate
): string =>
  `https://accounts.zoho.${tokenGenerateData.location}/oauth/v2/token?code=${
    tokenGenerateData.grantToken
  }&redirect_uri=${tokenGenerateData.redirectUri}&client_id=${
    tokenGenerateData.clientId
  }&client_secret=${
    tokenGenerateData.clientSecret
  }&grant_type=authorization_code`

export const getTokenRefreshUrl = (tokenRefreshData: ITokenRefresh): string => {
  return `https://accounts.zoho.${
    tokenRefreshData.location
  }/oauth/v2/token?refresh_token=${tokenRefreshData.refreshToken}&client_id=${
    tokenRefreshData.clientId
  }&client_secret=${tokenRefreshData.clientSecret}&grant_type=refresh_token`
}

export const getZohoUrl = (config: IConfig, moduleName: string) =>
  `https://www.zohoapis.${config.location}/crm/v2/${moduleName}${
    moduleName === 'users' ? '?type=ActiveUsers' : ''
  }`
//
