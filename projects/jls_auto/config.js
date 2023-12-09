const env = process.env.NODE_DEV || 'development'
const credentials = require(`./.credentials.${env}`)
module.exports = { credentials }