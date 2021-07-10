# Node.js RESTful API

Practice from Pirple's NodeJS Master Class

## Introduction

To build a RESTful API for an uptime monitoring application, using no NPM package - but a number of built-in Node modules.

User must be able to sign-in and sign-out. Whenever a 'up' or 'down' event occurs, the app will send a SMS via Twilio (with no third parties libs).

> For this practice, no DB will be used. Data storage will use the file system as a key-value store of JSON docs.

## Backend Specifications

1. The API listens on a PORT and accepts incoming HTTP requests for POST, GET, PUT, DELET and HEAD

2. The API allows a client to connect, then create a new user, then edit and delte that user.

3. The API allows a user to 'sign in' which gives them a token that they can use for subsequent authenticated requests.

4. The API allows the user to 'sign out' which invalidates their token.

5. The API allows a signed-in user to use their token to create a new 'check'.

6. The API allows a signed-in user to edit or delete any of their checks.

7. In the background, workers perform all the 'checks' at the appropriate times, and send alerts to the users whenn a check changes its state from 'up' to 'down', or visa versa.

## Step by Step

### \#0.1.0. HTTP Server

We basically create the main file ( `./index.js` ), then we require the native module `http` from node.js.

So we import this module as a `const` called _http_ and create a server with the `http`  `createServer` method (that has as its argument a callback function that can receive the **request** - `req` -, and **response** - `res` - arguments).

Finally, we make the server to listen to port 3000 (and also define a callback the show on the console that the server is listening to port 3000). So our `index.js` looks like the snippet bellow:

```js
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
```

### \#0.2.0 Request Path Parse

We assign the `url` node.js lib to `const url` .

Then we parse the URL to get its path, so we can send the response according to the path.

```js
// Get URL and parse it (true is for parsing the URL)
const parsedUrl = url.parse(req.url, true)

// Get the path
const path = parsedUrl.pathname,
    trimmedPath = path.replace(/^\/+|\/+$/g, '')

// Send the response
res.end('HTTP Server Response\n')
```

And then we log the request path:

```js
// Log the request path
console.log(`Request received on path: ${trimmedPath}`)
```

With the server running ( `node index.js` ), open a new terminal and run `curl localhost:3000/foo/bar/` (and other variations) to see the parsed path log. Notice that we remove the initial slash - as well as last slash if there is no chars after it.

### \#0.3.0 HTTP Methods Parse

We must allow the following methods: `GET` , `POST` , `PUT` , `DELETE` and `HEAD` .

But before doing that, we must get the HTTP method.

```js
// Get the HTTP method
const method = req.method.toLowerCase()
```

And we'll also log it:

```js
// Log the request path and its method
console.log(`Request received on path: ${trimmedPath} with method ${method}`)
```

You can run `curl localhost:3000/foo-bar/baz/` to check it working.

## Changelog

### v0.3.0 | HTTP Methods Parse

**Features**

* HTTP methods parsed

* Request log updated

* Documentation updated

### v0.2.0 | Request Path Parse

**Features**

* Request path parsed and logged out

* Documentation updated

### v0.1.0 | HTTP Server

**Features**

* HTTP server created

* Scaffolding (project folders and files structure)

* README.md created
