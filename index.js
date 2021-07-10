/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http')

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
  res.end('HTTP Server Response\n')
})

// Start the server, and have it listen on port 3000
server.listen(3000, () => console.log('Server listening port 3000'))