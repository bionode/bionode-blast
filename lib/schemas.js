'use strict'

const common = {
  definitions: {
    RID: {
      type: 'string',
      description: 'Request ID'
    },
    ALIGNMENTS: {
      type: 'integer',
      minimum: 1,
      description: 'Number of alignments to print (for Text,HTML)'
    },
    HITLIST_SIZE: {
      type: 'integer',
      minimum: 1,
      description: 'Number of database sequences to keep'
    },
    DESCRIPTIONS: {
      type: 'integer',
      minimum: 1,
      description: 'Number of descriptions to print (for Text,HTML)'
    },
    FORMAT_TYPE: {
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
exports.deleteSchema = Object.assign({}, common, {
  type: 'object',
  properties: {
    RID: { '$ref': '#/definitions/RID' }
  },
  required: [ 'RID' ]
})

// For CMD=Get
exports.getSchema = Object.assign({}, common, {
  type: 'object',
  properties: {
    RID: { '$ref': '#/definitions/RID' },
    FORMAT_TYPE: { '$ref': '#/definitions/FORMAT_TYPE' },
    HITLIST_SIZE: { '$ref': '#/definitions/HITLIST_SIZE' },
    DESCRIPTIONS: { '$ref': '#/definitions/DESCRIPTIONS' },
    ALIGNMENTS: { '$ref': '#/definitions/ALIGNMENTS' },
    NCBI_GI: { '$ref': '#/definitions/NCBI_GI' },
    FORMAT_OBJECT: {
      type: 'string',
      enum: [ 'SearchInfo', 'Alignment' ],
      description: 'SearchInfo (status check) or Alignment (report formatting)'
    }
  },
  required: [ 'RID' ]
})

// For CMD=Put
exports.putSchema = Object.assign({}, common, {
  type: 'object',
  properties: {
    QUERY: {
      type: 'string',
      description: 'Accession, GI, or FASTA'
    },
    DATABASE: {
      type: 'string',
      enum: [ 'nr', 'refseq_protein', 'landmark', 'swissprot', 'pat', 'pdb', 'env_nr', 'tsa_nr' ],
      description: 'Search database'
    },
    PROGRAM: {
      type: 'string',
      enum: [ 'blastn', 'blastp', 'blastx', 'tblastn', 'tblastx', 'megablast' ],
      description: 'Program'
    },
    FILTER: {
      type: 'string',
      enum: [ 'F', 'T', 'L', 'mT', 'mL' ],
      description: 'Low complexity filtering'
    },
    FORMAT_TYPE: { '$ref': '#/definitions/FORMAT_TYPE' },
    EXPECT: {
      type: 'number',
      minimum: 0,
      description: 'Expect value'
    },
    NUCL_REWARD: {
      type: 'integer',
      minimum: 0,
      description: 'Reward for matching bases (blastn and megablast)'
    },
    NUCL_PENALTY: {
      type: 'integer',
      minimum: 0,
      description: 'Cost for mismatched bases (blastn and megablast)'
    },
    GAPCOSTS: {
      type: 'string',
      description: 'Gap existence and extension costs; Pair of positive integers separate by a space, e.g. "11 1"'
    },
    MATRIX: {
      type: 'string',
      enum: [ 'PAM30', 'PAM70', 'PAM250', 'BLOSUM45', 'BLOSUM50', 'BLOSUM62', 'BLOSUM80', 'BLOSUM90' ]
    },
    HITLIST_SIZE: { '$ref': '#/definitions/HITLIST_SIZE' },
    DESCRIPTIONS: { '$ref': '#/definitions/DESCRIPTIONS' },
    ALIGNMENTS: { '$ref': '#/definitions/ALIGNMENTS' },
    NCBI_GI: { '$ref': '#/definitions/NCBI_GI' },
    THRESHOLD: {
      type: 'integer',
      minimum: 0,
      description: 'Neighboring score for initial words'
    },
    WORD_SIZE: {
      type: 'integer',
      minimum: 0,
      description: 'Size of word for initial matches'
    },
    COMPOSITION_BASED_STATISTICS: {
      type: 'integer',
      enum: [ 0, 1, 2, 3 ],
      description: `
        0: No adjustment;
        1: Composition-based statistics;
        2: Conditional compositional score matrix adjustment;
        3: Universal compositional score matrix adjustment;
        See comp_based_stats in BLAST manual
      `
    },
    NUM_THREADS: {
      type: 'integer',
      minimum: 1,
      description: 'Supported only on the cloud'
    }
  },
  required: [ 'QUERY', 'DATABASE', 'PROGRAM' ]
})

