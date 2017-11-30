const qs = require('querystring').stringify
const util = require('util')
const _ = require('lodash')

module.exports.buildURLString = (
  config,
  moduleName,
  zohoMethod,
  params = {},
  misc = ''
) =>
  `https://${config.host}/crm/private/json/${moduleName}/${
    zohoMethod
  }?&scope=crmapi&&version=${config.version}&authtoken=${config.authToken}&${qs(
    params
  )}${misc}`

module.exports.toXmlData = (moduleName, data) => {
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

module.exports.fromXmlData = data => {
  return data.FL.reduce((p, c) => {
    return { ...p, [c.val]: c.content }
  }, {})
}
