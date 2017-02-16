'use strict'

const statusCheck = require('./statusCheck.js')

module.exports = (RID) => new Promise((resolve, reject) => { 
  const INTERVAL = 30 * 1000
  let startTime = Date.now()

  console.log(`Beginning status checks for RID: ${RID}`) 

  const cb = () =>
    statusCheck(RID)
      .then(({ message, done }) => {
        const elapsed = Date.now() - startTime
        process.stdout.write(`\r[${elapsed}s] Status message: `, message)

        if (done) {
          clearInterval(poller)
          return resolve(RID)
        }
      })
      .catch((err) => {
        clearInterval(poller)
        return reject(err)
      })

  const poller = setInterval(cb, INTERVAL)
})

