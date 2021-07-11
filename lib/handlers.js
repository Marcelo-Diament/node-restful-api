// Define the handlers
const handlers = {}

// Ping handler
handlers.ping = (data, callback) => {
  // Callback a http status code
  callback(200)
}

// Sample handler
handlers.sample = (data, callback) => {
  // Callback a http status code, and a payload object
  callback(406, { 'name': 'Sample handler' })
}

// Not found handler
handlers.notFound = (data, callback) => {
  // Callback a http status code, and a payload object
  callback(404)
}

module.exports = handlers