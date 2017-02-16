'use strict'

const fs = require('fs')

const submit = require('./lib/submit.js')
const pollUntil = require('./lib/pollUntil.js')
const retrieve = require('./lib/retrieve.js')

const RID = process.argv[2]
const outfile = process.argv[3]

const getOutstream = () => (outfile === '-' || outfile === undefined) ? process.stdout : fs.createWriteStream(outfile)

// submit({
//   QUERY: '>tr|F4IWH1|F4IWH1_ARATH Uncharacterized protein OS=Arabidopsis thaliana GN=At3g27350 PE=4 SV=1\nMGESAVLVHSYSFAAPITRNDSHEENTIHALSQSISFGKFMTENLEWGKWSSFSHKKYVE EAEKYSRPGSVAQKKAFFEAHYKRIAEAKKAATEEQPSVTPAEVLLHTLETQPPPPPPPL VLKYGEEGRERNSFQIDDHDVTDELENVMFGGDYVKEEEEKKVEEELLKEDWSVGEKEKQ HRKSVTKNRPVFRLSLEKTIPPKSLDEISLTEKRSERPMTQVEEKPVHRQRFGLLSCFIS NAKTQDQNQSRNKRKTEKKKQFLCLCLKPKTIREWHRLCSIHTSLEKSPSAIGISFFCLV LFESLLSVLLCNERTTPVS',
//   DATABASE: 'nr',
//   PROGRAM: 'blastp',
//   FORMAT_TYPE: 'Text',
//   EXPECT: 1e-20,
//   GAPCOSTS: '11 1',
//   MATRIX: 'BLOSUM62',
//   HITLIST_SIZE: 250,
//   DESCRIPTIONS: 250,
//   ALIGNMENTS: 50,
//   WORD_SIZE: 6,
//   COMPOSITION_BASED_STATISTICS: 2
// })
//   .then(({ RID }) => pollUntil(RID))
//   .then((RID) => console.log(`RID ${RID} is ready for fetching alignments`))
//   .catch(console.error)

retrieve(RID, { FORMAT_TYPE: 'JSON2' })
  .then((res) => res.pipe(getOutstream()))
  .catch(console.error)
