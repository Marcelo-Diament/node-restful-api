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

    // Send the response
    res.end('HTTP Server Response\n')

    // Log the request path and its method, query strings parameters, headers and payload
    console.log(`Path: ${trimmedPath}\nMethod: ${method}\nQuery strings parameters:`, queryStringObject, `\nHeaders:`, headers, `\nPayload:`, buffer)

  })

})

// Start the server, and have it listen on port 3000
server.listen(3000, () => console.log('Server listening port 3000'))