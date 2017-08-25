'use strict'

const https = require('https')
const querystring = require('querystring')

const jszip = require('jszip')
const concat = require('concat-stream')
const streamifier = require('streamifier')

const { BASE_URL } = require('./constants.js')

const get = (url) => new Promise((resolve, reject) => https.get(url, resolve).on('error', reject))

const getZip = (url) => new Promise((resolve, reject) =>
  get(url)
    .then((res) => res.pipe(concat(resolve)))
    .catch(reject)
)

const zipToJSON = (RID) => (zipBuffer) => jszip.loadAsync(zipBuffer)
  .then(zip => zip.file(`${RID}_1.json`).async('nodebuffer'))

// Resolves to a stream
module.exports = (RID, params = {}) => new Promise((resolve, reject) => {
  params = Object.assign({}, {
    FORMAT_TYPE: 'Text' // JSON2
  }, params)

  // TODO validate params against schema

  const url = BASE_URL + '?' + querystring.stringify(Object.assign({}, {
    CMD: 'Get',
    RID
  }, params))

  if (params.FORMAT_TYPE === 'JSON2') {
    getZip(url)
      .then(zipToJSON(RID))
      .then((results) => resolve(streamifier.createReadStream(results)))
      .catch(reject)
  } else if (params.FORMAT_TYPE === 'Text') {
    get(url).then(resolve).catch(reject)
  }
})
