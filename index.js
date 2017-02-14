'use strict'

const fs = require('fs')
const https = require('https')

const jszip = require('jszip')
const concat = require('concat-stream')
const streamifier = require('streamifier')

const BASE_URL = 'https://blast.ncbi.nlm.nih.gov/Blast.cgi'

const RID = process.argv[2]
const outfile = process.argv[3]

const objToParams = (obj) => Object.keys(obj).reduce(function (sum, key, i) {
  return sum + (i === 0 ? '' : '&') + `${key}=${obj[key]}`
}, '')


const params = {
  RID,
  CMD: 'Get',
  // FORMAT_TYPE: 'JSON2'
  FORMAT_TYPE: 'Text'
}

// For CMD=Delete
const deleteParams = {
  RID: ''
}

// For CMD=Get
const getParams = {
  FORMAT_TYPE: 'Text',
  HITLIST_SIZE: 50,
  DESCRIPTIONS: 10,
  ALIGNMENTS: 10,
  NCBI_GI: 'T',
  RID: '',
  FORMAT_OBJECT: 'SearchInfo' // SearchInfo (status check) or Alignment (report formatting)
}

// For CMD=Put
const putParams = {
  QUERY: 'F4IWH1_ARATH', // Accession, GI, or FASTA; Search query
  DATABASE: 'nr', // See appendix 2
  PROGRAM: 'blastp', // blastn, megablast, blastp, blastx, tblastn, tblastx
  FILTER: 'F', // T or L to enable, prepend m for mask lookup (e.g. mL); Low complexity filtering
  FORMAT_TYPE: 'JSON2', // HTML, Text, XML, XML2, JSON2, Tabular; Report type
  EXPECT: 1.0, // Double greater than 0; Expect value
  NUCL_REWARD: 1, // Integer greater than 0; Reward for matching bases (blastn and megablast)
  NUCL_PENALTY: -1, // Integer less than 0; Cost for mismatched bases (blastn and megablast)
  GAPCOSTS: '11 1', // Pair of positive integers separated by a space; Gap existence and extension costs
  MATRIX: 'BLOSUM62', // BLOSUM45, BLOSUM50, BLOSUM62, BLOSUM80, BLOSUM90, PAM250, PAM30, PAM70
  HITLIST_SIZE: 250, // Integer greater than 0; Number of database sequences to keep
  DESCRIPTIONS: 10, // Integer greater than 0; Number of descriptions to print (for Text,HTML)
  ALIGNMENTS: 10, // Integer greater than 0; Number of alignments to print (for Text, HTML)
  NCBI_GI: 'T', // T or F; Show NCBI GIs in report
  THRESHOLD: 11, // Positive integer; Neighboring score for initial words
  WORD_SIZE: 6, // Positive integer; Size of word for initial matches
  COMPOSITION_BASED_STATISTICS: 0, // One of 0,1,2,3. See comp_based_stats in BLAST manual
  NUM_THREADS: 1, // Integer greater than 0, supported only on the cloud
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


if (params.FORMAT_TYPE === 'JSON2') {
  getZip()
    .then(zipToJSON)
    .catch(console.error)
    .then(results => streamifier.createReadStream(results).pipe(getOutstream()))
} else {
  get(requestURL()).then((res) => res.pipe(getOutstream()))
}


