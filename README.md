# bionode-blast

NodeJS API wrapping the NCBI BLAST [Common URL API](https://ncbi.github.io/blast-cloud/dev/api.html).
WIP.

Goals are to
- provide a (typed) JS API that makes it simpler to work NCBI BLAST
  - probably Flow since it makes clean JS after flow-remove-types
  - question: how to support Flow and TS type libraries/definitions?
- interporates well with other bionode modules: streams compatible (e.g. object stream of matches)
- CLI API
- express REST server wrapping JS API to provide a truly REST interface
- once finalized, illustrate interoperability with webapp/Electron/BioJS visualization modules
  - e.g. Electron BLAST app that automatically stores results locally

TODO
- [ ] Only allow some params conditonal on other params
    - e.g. description only allowed when report is Text/HTML
- [ ] Param validation
- [ ] Param description
- [ ] Param defaults
- [ ] Param defaults conditional on other params
    - e.g. if program is blastp or blastn, change word size
- [ ] Configurable param defaults
- [ ] Response schema
- [ ] Typed params
- [ ] Typed response
- [ ] RAML/Swagger spec REST API, local wrapper server
