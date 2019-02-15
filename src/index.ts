import axios from 'axios'
import * as checkEnv from 'check-env'
import utils from './utils'
import { IConfig } from './interfaces'

class Zoho {
  config: IConfig
  constructor() {
    try {
      checkEnv(['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET'])
    } catch (e) {
      utils.log('zoho-crm', 'constructor', e.message)
    }
    const {
      ZOHO_TOKEN_STORE = 'zohoTokens',
      ZOHO_CLIENT_ID = '',
      ZOHO_CLIENT_SECRET = '',
      ZOHO_GRANT_TOKEN = '',
      ZOHO_LOCATION = 'com',
      API_URL = ''
    } = process.env
    this.config = {
      tokenStore: ZOHO_TOKEN_STORE,
      clientId: ZOHO_CLIENT_ID,
      clientSecret: ZOHO_CLIENT_SECRET,
      grantToken: ZOHO_GRANT_TOKEN,
      location: ZOHO_LOCATION,
      apiUrl: API_URL,
      maxRead: 200, // Maximum number of records to get per query
      maxReadById: 100, // Maximum number of records to get per query with id list
      maxUpdate: 100 // Maximum number of records to update per query
    }
  }

  configure = (
    config: { maxRead?: number; maxReadById?: number; maxUpdate?: number } = {}
  ) => {
    this.config = { ...this.config, ...config }
  }

  get = async (
    criteria: { id?: string; ownerId?: string } = {},
    columns: Array<string> = [],
    moduleName: string = 'deals'
  ): Promise<Array<{}> | {} | null> => {
    const returnedObjectName =
      moduleName.toLowerCase() === 'users' ? 'users' : 'data'
    const { id } = criteria
    const url = `${utils.getUrl(this.config, moduleName.toLowerCase())}${
      id ? '/' + id : ''
    }`
    try {
      const token = await utils.getToken(this.config)
      const response = await axios.get(
        `${url}${utils.getQueryFields(columns)}`,
        {
          headers: { Authorization: `Zoho-oauthtoken ${token}` }
        }
      )
      if (!response.data[returnedObjectName].length) {
        utils.log('zoho-crm', 'get', `No data returned (${url})`)
        return null
      }
      const data = utils.replaceSpaces(response.data[returnedObjectName], true)
      return id ? data[0] : data
    } catch (e) {
      utils.log('zoho-crm', 'get', `${e.message} (${url})`)
      return []
    }
  }

  update = async (
    data: object | Array<object>,
    moduleName: string = 'deals'
  ) => {
    const url = utils.getUrl(this.config, moduleName.toLowerCase())
    let responseDetails
    try {
      let dataArray = utils.replaceSpaces(Array.isArray(data) ? data : [data])

      const step = this.config.maxUpdate
      let index = 0
      let response = Array.isArray(data) ? [] : {}
      do {
        const token = await utils.getToken(this.config)
        const zohoResponse = await axios.put(
          url,
          {
            data: dataArray.slice(index, index + step)
          },
          {
            headers: { Authorization: `Zoho-oauthtoken ${token}` }
          }
        )

        responseDetails = zohoResponse.data.data[0]

        if (responseDetails.status === 'error') {
          utils.log(
            'zoho-crm',
            'update',
            `${responseDetails.message} (${JSON.stringify(dataArray[0])})`
          )
          return null
        }
        index = index + step
      } while (dataArray.length > index)
      return responseDetails
    } catch (e) {
      utils.log('zoho-crm', 'update', `${e.message} (${url})`)
    }
  }
}

module.exports = new Zoho()
