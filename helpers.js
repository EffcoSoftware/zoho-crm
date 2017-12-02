const qs = require('querystring').stringify
const util = require('util')
const _ = require('lodash')
const axios = require('axios')

const buildURLString = (
  config,
  moduleName,
  zohoMethod,
  params = {},
  misc = ''
) =>
  `https://${config.host}/crm/private/json/${moduleName}/${
    zohoMethod
  }?scope=crmapi&version=${config.version}&authtoken=${config.authToken}&${qs(
    params
  )}${misc}`

const toXmlData = (moduleName, data) => {
  var rows
  if (!_.isArray(data)) {
    rows = [data]
  } else {
    rows = data
  }

  var ret = util.format('<%s>', moduleName)
  rows.forEach(function(row, idx) {
    ret += util.format('<row no="%s">', idx + 1)
    _.each(row, function(value, key) {
      if (!_.isUndefined(value) || !_.isNull(value)) {
        ret += util.format('<FL val="%s"><![CDATA[%s]]></FL>', key, value)
      }
    })
    ret += util.format('</row>')
  })
  ret += util.format('</%s>', moduleName)
  return ret
}

const fromXmlData = data =>
  Array.isArray(data.FL)
    ? data.FL.reduce((p, c) => ({ ...p, [c.val]: c.content }), {})
    : { [data.FL.val]: data.FL.content }
const selectColumns = (columns = []) => `(${columns.join(',')})`
const selectIds = (ids = []) => ids.join(';')

const retrieveAllModuleData = async (config, moduleName, ownerId, columns) => {
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
          ownerId
            ? `&criteria=(Deal Owner:${ownerId})`
            : '' +
              (columns.length ? `&selectColumns=${selectColumns(columns)}` : '')
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

module.exports = {
  buildURLString,
  toXmlData,
  fromXmlData,
  selectColumns,
  selectIds,
  retrieveAllModuleData,
  validateInit,
  logError
}
