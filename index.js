const axios = require('axios')
const _ = require('lodash')
const {
  buildURLString,
  fromXmlData,
  toXmlData,
  selectColumns,
  selectIds,
  validateInit,
  retrieveAllModuleData,
  logError
} = require('./helpers')

class Zoho {
  constructor() {
    this.config = {
      host: 'crm.zoho.com',
      version: 2, // Version of API
      maxRead: 200, // Maximum number of records to get per query
      maxReadById: 100, // Maximum number of records to get per query with id list
      maxUpdate: 100 // Maximum number of records to update per query
    }
  }

  init(config) {
    this.config = { ...this.config, ...config }
  }

  async get(moduleName = 'Deals', criteria = {}, columns = []) {
    if (!validateInit(this.config)) return
    const { id, ownerId } = criteria
    if (
      (id && typeof id !== 'string' && !Array.isArray(id)) ||
      (ownerId && typeof ownerId !== 'string')
    )
      throw new Error(
        "'get' function requires ids to be passed as String or an Array"
      )
    // Retrieve users using 'getUsers' method
    if (moduleName === 'Users') {
      criteria = { type: 'ActiveUsers', ...criteria }
      return (await axios.get(
        buildURLString(this.config, moduleName, 'getUsers', criteria)
      )).data.users.user
    }
    // Retrieve single record using 'getRecords' method
    if (id && !Array.isArray(id))
      return fromXmlData(
        (await axios.get(
          buildURLString(this.config, moduleName, 'getRecords', { id })
        )).data.response.result[moduleName].row
      )
    else if (id) {
      // Retrieve multiple records using 'getRecordsbyId' method
      const step = this.config.maxReadById
      let index = 0
      let stepModuleData = []
      let allModuleData = []
      do {
        const zohoResponse = (await axios.get(
          buildURLString(
            this.config,
            moduleName,
            'getRecordById',
            null,
            `&idlist=${selectIds(id.slice(index, index + step - 1))}` +
              (columns.length ? `&selectColumns=${selectColumns(columns)}` : '')
          )
        )).data.response
        if (zohoResponse.nodata) return []
        if (zohoResponse.error) {
          throw new Error(
            `API error ${zohoResponse.error.code}, ${
              zohoResponse.error.message
            }`
          )
        }
        stepModuleData = zohoResponse.result[moduleName].row
        if (Array.isArray(stepModuleData))
          allModuleData = allModuleData.concat(
            _.map(stepModuleData, fromXmlData)
          )
        else allModuleData.push(fromXmlData(stepModuleData))
        index = index + step
      } while (stepModuleData.length === step)
      return allModuleData
    }
    // Retrieve all records using 'getRecords' method
    return await retrieveAllModuleData(
      this.config,
      moduleName,
      ownerId,
      columns
    )
  }

  async update(moduleName = 'Deals', data) {
    try {
      if (!validateInit(this.config)) return null
      let dataArray = data
      if (!Array.isArray(data)) dataArray = [dataArray]
      const step = this.config.maxUpdate
      let index = 0
      let response = Array.isArray(data) ? [] : {}
      do {
        const zohoResponse = (await axios.post(
          buildURLString(
            { ...this.config, version: 4 },
            moduleName,
            'updateRecords',
            null,
            `xmlData=${toXmlData(
              moduleName,
              dataArray
                .slice(index, index + step - 1)
                .map(({ id, ...rest }) => ({ Id: id, ...rest }))
            )}`
          )
        )).data.response
        if (zohoResponse.error) {
          throw new Error(
            `API error ${zohoResponse.error.code}, ${
              zohoResponse.error.message
            }`
          )
        }
        const zohoResponseRow = zohoResponse.result.row
        if (!Array.isArray(data))
          return fromXmlData(zohoResponseRow.success.details)
        zohoResponseRow.map(r => response.push(fromXmlData(r.success.details)))
        index = index + step
      } while (data.length > index)
      return response
    } catch (e) {
      logError(e)
    }
  }
}

module.exports = new Zoho()
