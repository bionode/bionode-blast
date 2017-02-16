'use strict'

const fs = require('fs')

const inFile = process.argv[2]
const outFile = process.argv[3]

const results = JSON.parse(fs.readFileSync(inFile, 'utf-8'))


const alignments = results.BlastOutput2.report.results.search.hits

const getOutStream = () => outFile === '-' ? process.stdout : fs.createWriteStream(outFile)

const outStream = getOutStream()

for (let i = 0; i < alignments.length; i++) {
  const alignment = alignments[i]

  for (let j = 0; j < alignment.description.length; j++) {
    outStream.write('>' + alignment.description[j].id + '\n')
  }

  for (let j = 0; j < alignment.hsps.length; j++) {
    outStream.write(alignment.hsps[j].qseq + '\n')
    outStream.write(alignment.hsps[j].midline + '\n')
    outStream.write(alignment.hsps[j].hseq + '\n')
    outStream.write('\n\n')
  }

  outStream.write('\n\n=====================\n\n')
}

if (outFile !== '-') {
  outStream.end()
  console.log('Finished')
}
