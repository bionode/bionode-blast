'use strict'

const split = require('split2')
const { validate } = require('jsonschema')

const https = require('https')
const querystring = require('querystring')

const { HOSTNAME, PATH } = require('./constants.js')
const { putSchema } = require('./schemas.js')

module.exports = (params) => new Promise((resolve, reject) => {
  try {
    const validation = validate(params, putSchema)

    if (validation.errors.length !== 0) {
      validation.errors.forEach(console.error)
      return reject(validation.errors)
    }
  } catch (e) {
    return reject(e)
  }

  const postData = querystring.stringify(Object.assign({}, params, { CMD: 'Put' }))

  const options = {
    hostname: HOSTNAME,
    path: PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }
  
  const req = https.request(options, (res) => {
    res.setEncoding('utf8')

    /* We are looking for:
    <!--QBlastInfoBegin
        RID = A7X7B6Y3015
        RTOE = 37
    QBlastInfoEnd
    -->
    */

    let RID
    let RTOE

    res.pipe(split())
      .on('data', function (line) {
        const RIDMatch = line.match(/^    RID = (.+)$/)
        if (RIDMatch) {
          RID = RIDMatch[1]
        }

        const RTOEMatch = line.match(/^    RTOE = (.+)$/)
        if (RTOEMatch) {
          RTOE = RTOEMatch[1]
        }
      })

    res.on('end', () => resolve({ RID, RTOE }))
  })

  req.on('error', reject)

  req.write(postData)
  req.end()
})

