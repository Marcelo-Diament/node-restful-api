/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http'),
  url = require('url')

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

  // Send the response
  res.end('HTTP Server Response\n')

  // Log the request path and its method, query strings parameters and headers
  console.log(`Request received on path: ${trimmedPath} with method ${method} and this query strings parameters:`, queryStringObject, `And these are the request headers:`, headers)

})

// Start the server, and have it listen on port 3000
server.listen(3000, () => console.log('Server listening port 3000'))