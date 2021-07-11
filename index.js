/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http'),
  url = require('url'),
  StringDecoder = require('string_decoder').StringDecoder

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {

  // Get URL and parse it
  const parsedUrl = url.parse(req.url, true)

  // Get the path
  const path = parsedUrl.pathname,
    trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query strings as an object
  const queryStringObject = parsedUrl.query

  // Get the HTTP method
  const method = req.method.toLowerCase()

  // Get the headers as an object
  const headers = req.headers

  // Get the payload, if there is any
  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', data => buffer += decoder.write(data))
  req.on('end', () => {
    buffer += decoder.end()

    // Choose the handler this request should go to. If one is not found, use the notFound handler
    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined'
      ? router[trimmedPath]
      : handlers.notFound

    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload': buffer
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200

      // Use the payload called back by the handler, or default to an empty object
      payload = typeof (payload) == 'object' ? payload : {}

      // Convert the payload handler is sending back to the user to a string
      const payloadString = JSON.stringify(payload)

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      // Log the request path and its method, query strings parameters, headers and payload
      console.log(`Path: ${trimmedPath}\nMethod: ${method}\nQuery strings parameters:`, queryStringObject, `\nHeaders:`, headers, `\nPayload sent:`, buffer, '\nResponse status code:', statusCode, '\nResponse payload:', payloadString)
    })

  })

})

// Start the server, and have it listen on port 3000
server.listen(3000, () => console.log('Server listening port 3000'))

// Define the handlers
const handlers = {}

// Sample handler
handlers.sample = (data, callback) => {
  // Callback a http status code, and a payload object
  callback(406, { 'name': 'Sample handler' })
}

// Not foun handler
handlers.notFound = (data, callback) => {
  // Callback a http status code, and a payload object
  callback(404)
}

// Defin a request router
const router = {
  'sample': handlers.sample
}