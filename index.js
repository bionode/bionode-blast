'use strict'

const fs = require('fs')
const https = require('https')
const querystring = require('querystring')

const jszip = require('jszip')
const concat = require('concat-stream')
const streamifier = require('streamifier')
const split = require('split2')
const { validate } = require('jsonschema')

const { getSchema, putSchema, deleteSchema } = require('./lib/schemas.js')

const BASE_URL = 'https://blast.ncbi.nlm.nih.gov/Blast.cgi'

const RID = process.argv[2]
const outfile = process.argv[3]


const getParams = {
  RID,
  CMD: 'Get',
  // FORMAT_TYPE: 'JSON2'
  FORMAT_TYPE: 'Text'
}

const getOutstream = () => outfile === '-' ? process.stdout : fs.createWriteStream(outfile)

const get = (url) => new Promise((resolve, reject) => https.get(url, resolve).on('error', reject))

const requestURL = () => BASE_URL + '?' + objToParams(params)

const getZip = () => new Promise((resolve, reject) =>
  get(requestURL())
    .then((res) => res.pipe(concat(resolve)))
    .catch(reject)
)

const zipToJSON = (zipBuffer) => jszip.loadAsync(zipBuffer)
  .then(zip => zip.file(`${RID}_1.json`).async('nodebuffer'))


// if (params.FORMAT_TYPE === 'JSON2') {
//   getZip()
//     .then(zipToJSON)
//     .catch(console.error)
//     .then(results => streamifier.createReadStream(results).pipe(getOutstream()))
// } else {
//   get(requestURL()).then((res) => res.pipe(getOutstream()))
// }


const submitQuery = (params) => new Promise((resolve, reject) => {
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
    hostname: 'blast.ncbi.nlm.nih.gov',
    path: '/Blast.cgi',
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


submitQuery({
  QUERY: '>tr|F4IWH1|F4IWH1_ARATH Uncharacterized protein OS=Arabidopsis thaliana GN=At3g27350 PE=4 SV=1\nMGESAVLVHSYSFAAPITRNDSHEENTIHALSQSISFGKFMTENLEWGKWSSFSHKKYVE EAEKYSRPGSVAQKKAFFEAHYKRIAEAKKAATEEQPSVTPAEVLLHTLETQPPPPPPPL VLKYGEEGRERNSFQIDDHDVTDELENVMFGGDYVKEEEEKKVEEELLKEDWSVGEKEKQ HRKSVTKNRPVFRLSLEKTIPPKSLDEISLTEKRSERPMTQVEEKPVHRQRFGLLSCFIS NAKTQDQNQSRNKRKTEKKKQFLCLCLKPKTIREWHRLCSIHTSLEKSPSAIGISFFCLV LFESLLSVLLCNERTTPVS',
  DATABASE: 'nr',
  PROGRAM: 'blastp',
  FORMAT_TYPE: 'Text',
  EXPECT: 1e-20,
  GAPCOSTS: '11 1',
  MATRIX: 'BLOSUM62',
  HITLIST_SIZE: 250,
  DESCRIPTIONS: 250,
  ALIGNMENTS: 50,
  WORD_SIZE: 6,
  COMPOSITION_BASED_STATISTICS: 2
}).then(console.log)
  .catch(console.error)
