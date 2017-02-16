'use strict'

const https = require('https')
const querystring = require('querystring')
const split = require('split2')

const { BASE_URL } = require('./constants.js')

module.exports = (RID) => new Promise((resolve, reject) => {
  // TODO verify params against schema
  const url = BASE_URL + '?' + querystring.stringify({
    CMD: 'Get',
    RID,
    FORMAT_OBJECT: 'SearchInfo'
  })

  https.get(url, (res) => {
    res.setEncoding('utf8')

    let hits = false

    res.pipe(split()).on('data', function (line) {
      if (line.match(/\s+ThereAreHits=yes/)) {
        hits = true
      }

      if (line.match(/\s+Status=WAITING/)) {
        resolve({ message: 'Waiting', done: false })
      } else if (line.match(/\s+Status=FAILED/)) {
        reject(new Error('Search failed'))
      } else if (line.match(/\s+Status=UNKOWN/)) {
        reject(new Error('RID Expired'))
      } else if (line.match(/\s+Status=READY/)) {
        // TODO do not assume there are hits
        resolve({ message: 'Ready', done: true })
      }

    })
  }).on('error', reject)
})

