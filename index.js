/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http'),
  https = require('https'),
  url = require('url'),
  StringDecoder = require('string_decoder').StringDecoder,
  config = require('./config'),
  fs = require('fs'),
  handlers = require('./lib/handlers'),
  helpers = require('./lib/helpers')

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => unifiedServer(req, res))

// Start the HTTP server, and have it listen on port defined in config file
httpServer.listen(config.httpPort, () => console.log(`HTTP server listening port ${config.httpPort} in ${config.envName} environment`))

// HTTPS server options (key and certificate)
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}

// Instantiate the HTTPS server
const httpsServer = https.createServer(httpsServerOptions, (req, res) => unifiedServer(req, res))

// Start the HTTPS server, and have it listen on port defined in config file
httpsServer.listen(config.httpsPort, () => console.log(`HTTPS server listening port ${config.httpsPort} in ${config.envName} environment`))

// All the server logic for both http and https server
const unifiedServer = (req, res) => {
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
      'payload': helpers.parseJsonToObject(buffer)
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
}

// Define a request router
const router = {
  'sample': handlers.sample,
  'ping': handlers.ping,
  'users': handlers.users
}