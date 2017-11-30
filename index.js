const _ = require('lodash')
const axios = require('axios')
const { buildURLString, fromXmlData, toXmlData } = require('./helpers')

class Zoho {
  constructor() {
    this.config = {
      host: 'crm.zoho.com',
      version: 2, // Version of API
      maxRead: 200, // Maximum number of records to get per query
      maxUpdate: 100 // Maximum number of records to update per query
    }
  }

  init(config) {
    this.config = { ...this.config, ...config }
  }

  async get(moduleName = 'Deals', criteria = {}) {
    if (!validateInit(this.config)) return
    const { id, ownerId } = criteria
    if (
      (id && typeof id !== 'string') ||
      (ownerId && typeof ownerId !== 'string')
    )
      throw new Error("'get' function requires ids to be passed as String")
    // Retrieve users using 'getUsers' method
    if (moduleName === 'Users') {
      criteria = { type: 'ActiveUsers', ...criteria }
      return (await axios.get(
        buildURLString(this.config, moduleName, 'getUsers', criteria)
      )).data.users.user
    }
    // Retrieve single record using 'getRecords' method
    if (id)
      return fromXmlData(
        (await axios.get(
          buildURLString(this.config, moduleName, 'getRecords', { id })
        )).data.response.result[moduleName].row
      )
    // Retrieve all records using 'getRecords' method
    return await retrieveAllModuleData(this.config, moduleName, ownerId)
  }

  async update(moduleName = 'Deals', id, data) {
    try {
      if (!validateInit(this.config)) return null

      const zohoResponse = (await axios.post(
        buildURLString(this.config, moduleName, 'updateRecords', {
          id,
          xmlData: toXmlData(moduleName, data)
        })
      )).data.response
      if (zohoResponse.error) {
        throw new Error(
          `API error ${zohoResponse.error.code}, ${zohoResponse.error.message}`
        )
      }
      return fromXmlData(zohoResponse.result.recorddetail)
    } catch (e) {
      logError(e)
    }
  }
}

const retrieveAllModuleData = async (config, moduleName, ownerId) => {
  try {
    const step = config.maxRead
    let index = 1
    let stepModuleData = []
    let allModuleData = []

    do {
      const zohoResponse = (await axios.get(
        buildURLString(
          config,
          moduleName,
          ownerId ? 'searchRecords' : 'getRecords',
          { fromIndex: index, toIndex: index - 1 + step },
          ownerId ? `&criteria=(Deal Owner:${ownerId})` : ''
        )
      )).data.response
      if (zohoResponse.nodata) return []
      if (zohoResponse.error) {
        throw new Error(
          `API error ${zohoResponse.error.code}, ${zohoResponse.error.message}`
        )
      }
      stepModuleData = zohoResponse.result[moduleName].row
      if (Array.isArray(stepModuleData))
        allModuleData = allModuleData.concat(_.map(stepModuleData, fromXmlData))
      else allModuleData.push(fromXmlData(stepModuleData))
      index = index + step
    } while (stepModuleData.length === step)
    return allModuleData
  } catch (e) {
    logError(e)
  }
}

const validateInit = ({ authToken }) => {
  try {
    if (!authToken)
      throw new Error(
        "'init' function needs to be called first and requires valid config object with, at minimum, 'authToken' property set"
      )
    else return true
  } catch (e) {
    logError(e)
  }
}

const logError = err => {
  console.error(`Zoho-CRM Error: ${err.message}`)
}

module.exports = new Zoho()
