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

const common = {
  definitions: {
    RID: {
      type: 'string',
      description: 'Request ID'
    },
    alignments: {
      type: 'integer',
      minimum: 1,
      description: 'Number of alignments to print (for Text,HTML)'
    },
    hitlistSize: {
      type: 'integer',
      minimum: 1,
      description: 'Number of database sequences to keep'
    },
    descriptions: {
      type: 'integer',
      minimum: 1,
      description: 'Number of descriptions to print (for Text,HTML)'
    },
    formatType: {
      type: 'string',
      enum: [ 'HTML', 'Text', 'XML', 'XML2', 'JSON2', 'Tabular' ],
      description: 'Report type'
    },
    NCBI_GI: {
      type: 'string',
      enum: [ 'T', 'F' ],
      description: 'Show NCBI GIs in report'
    }
  }
}

// For CMD=Delete
const deleteSchema = Object.assign({}, common, {
  type: 'object',
  properties: {
    RID: { '$ref', '#/definitions/RID' }
  },
  required: [ 'RID' ]
})

// For CMD=Get
const getSchema = Object.assign({}, common, {
  type: 'object',
  properties: {
    RID: { '$ref', '#/definitions/RID' },
    formatType: { '$ref', '#/definitions/formatType' },
    hitlistSize: { '$ref', '#/definitions/hitlistSize' },
    descriptions: { '$ref', '#/definitions/descriptions' },
    alignments: { '$ref', '#/definitions/alignments' },
    NCBI_GI: { '$ref', '#/definitions/NCBI_GI' },
    formatObject: {
      type: 'string',
      enum: [ 'SearchInfo', 'Alignment' ],
      description: 'SearchInfo (status check) or Alignment (report formatting)'
    }
  },
  required: [ 'RID' ]
})

// For CMD=Put
const putSchema = Object.assign({}, common, {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Accession, GI, or FASTA'
    },
    database: {
      type: 'string',
      enum: [ 'nr', 'refseq_protein', 'landmark', 'swissprot', 'pat', 'pdb', 'env_nr', 'tsa_nr' ],
      description: 'Search database'
    },
    program: {
      type: 'string',
      enum: [ 'blastn', 'blastp', 'blastx', 'tblastn', 'tblastx', 'megablast' ],
      description: 'Program'
    },
    filter: {
      type: 'string',
      enum: [ 'F', 'T', 'L', 'mT', 'mL' ],
      description: 'Low complexity filtering'
    },
    formatType: { '$ref', '#/definitions/formatType' },
    expect: {
      type: 'number',
      minimum: 0,
      description: 'Expect value'
    },
    nucleotideReward: {
      type: 'integer',
      minimum: 0,
      description: 'Reward for matching bases (blastn and megablast)'
    },
    nucleotidePenalty: {
      type: 'integer',
      minimum: 0,
      description: 'Cost for mismatched bases (blastn and megablast)'
    },
    gapcosts: {
      type: 'string',
      description: 'Gap existence and extension costs; Pair of positive integers separate by a space, e.g. "11 1"'
    },
    matrix: {
      type: 'string',
      enum: [ 'PAM30', 'PAM70', 'PAM250', 'BLOSUM45', 'BLOSUM50', 'BLOSUM62', 'BLOSUM80', 'BLOSUM90' ]
    },
    hitlistSize: { '$ref', '#/definitions/hitlistSize' },
    descriptions: { '$ref', '#/definitions/descriptions' },
    alignments: { '$ref': '#/definitions/alignments' },
    NCBI_GI: { '$ref', '#/definitions/NCBI_GI' },
    threshold: {
      type: 'integer',
      minimum: 0,
      description: 'Neighboring score for initial words'
    },
    wordSize: {
      type: 'integer',
      minimum: 0,
      description: 'Size of word for initial matches'
    },
    compositionBasedStatistics: {
      type: 'integer',
      enum: [ 0, 1, 2, 3 ],
      description: 'See comp_based_stats in BLAST manual'
    },
    numThreads: {
      type: 'integer',
      minimum: 1,
      description: 'Supported only on the cloud'
    }
  },
  required: [ 'query', 'database', 'program' ]
})

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


