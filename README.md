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

### \#0.4.0 Query Strings Parse

All we need to do is to get it from `parsedUrl` :

```js
// Get the query strings as an object
const queryStringObject = parsedUrl.query
```

And we'll also log it out:

```js
// Log the request path and its method and query strings parameters
console.log(`Request received on path: ${trimmedPath} with method ${method} and this query strings parameters:`, queryStringObject)
```

You can run `curl localhost:3000/foo-bar/baz?lesson=query-strings\&parsed=true` to check it working.

### \#0.5.0 Request Headers Parse

Just like we did with methods, we just have to declare this code snippet below:

```js
// Get the headers as an object
const headers = req.headers
```

Lets update the log too:

```js
// Log the request path and its method, query strings parameters and headers
console.log(`Request received on path: ${trimmedPath} with method ${method} and this query strings parameters:`, queryStringObject, `And these are the request headers:`, headers)
```

Now, for testing purposes, we must use Postman or Insomnia. You can add as many headers you want to, such as: `color: blue` , `fruit: apple` and so on. So create a request like the one below within Postman:

| Field | Value |
| ----- | ----- |
| Method | GET |
| URL | localhost:3000/foo/bar?foo=bar&baz=true |
| Headers | |
| - color | blue |
| - fruit | apple |

The terminal will log something like this:

```sh
Request received on path: foo/bar with method get and this query strings parameters: { foo: 'bar', baz: 'true' } 
And these are the request headers: {
  color: 'blue',
  fruit: 'apple',
  'user-agent': 'PostmanRuntime/7.26.8',
  accept: '*/*',
  'cache-control': 'no-cache',
  'postman-token': '1a23456b-789c-1011-d1ef-21g31h41i51j617',
  host: 'localhost:3000',
  'accept-encoding': 'gzip, deflate, br',
  connection: 'keep-alive'
}
```

### \#0.6.0 Payloads Parse

The first step is to use the `string_decoder` :

```js
StringDecoder = require('string_decoder').StringDecoder
```

Then we must instanciate a new `StringDecoder` :

```js
const decoder = new StringDecoder('utf-8')
```

Once payloads come to HTTP server as little streams (bit of info instead the full data at once), we collect them as they are sent.
When we get at the streams end, the server can interpret the whole payload.

In order to deal with it, we'll create a `buffer` and on the event called 'data' we append the received data to the buffer through a StringDecoder.

```js
let buffer = ''
req.on('data', data => buffer += decoder.write(data))
```

When we reach the end of the streams, we finalize the buffer decoding and add the `res.end()` within this function:

```js
req.on('end', () => {
    buffer += decoder.end()

    // Send the response
    res.end('HTTP Server Response\n')

    // Log the request path and its method, query strings parameters, headers and payload
    console.log(`Path: ${trimmedPath}\nMethod: ${method}\nQuery strings parameters:`, queryStringObject, `\nHeaders:`, headers, `\nPayload:`, buffer)

})
```

> Even if there is no payload, the `end` event from `req` will be called.

To test our updates, lets change our Postman request method to Post and add a raw body. Thats the expected return:

```sh
Path: foo/bar
Method: post
Query strings parameters: [Object: null prototype] { foo: 'bar', baz: 'true' }
Headers: {
  color: 'blue',
  fruit: 'apple',
  'content-type': 'text/plain',
  'user-agent': 'PostmanRuntime/7.26.8',
  accept: '*/*',
  'cache-control': 'no-cache',
  'postman-token': '1a23456b-789c-1011-d1ef-21g31h41i51j617',
  host: 'localhost:3000',
  'accept-encoding': 'gzip, deflate, br',
  connection: 'keep-alive',
  'content-length': '22'
}
Payload: This is a request body
```

### \#0.7.0 Routes

The goal of this step is to package the data of request up in an object and send it on (route it) through request handlers.

So we must set up a rounting structure so HTTP server can route each request to the correct handler. We'll do it based on the path asked on the request. And in case there is no match between path and handler, we'll make a default route.

Firstly, we'll define a handler object. Then we'll define the sample handler, and also a 'not found' handler. Each one of them will receive `data` and a `callback` :

```js
// Define the handlers
const handlers = {}

// Sample handler
handlers.sample = (data, callback) => {
    // Callback a http status code, and a payload object
    callback(406, {
        'name': 'Sample handler'
    })
}

// Not foun handler
handlers.notFound = (data, callback) => {
    // Callback a http status code, and a payload object
    callback(404)
}
```

And we'll also define the initial request router:

```js
// Define a request router
const router = {
    'sample': handlers.sample
}
```

The next step is to update the http server so that it figures out which handler must be called depending on the path user is requesting, and sends out the data, receives the callback data from the handlers and send the response with the right status code:

```js
req.on('end', () => {
    buffer += decoder.end()

    // Choose the handler this request should go to. If one is not found, use the notFound handler
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

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
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200

        // Use the payload called back by the handler, or default to an empty object
        payload = typeof(payload) == 'object' ? payload : {}

        // Convert the payload handler is sending back to the user to a string
        const payloadString = JSON.stringify(payload)

        // Return the response
        res.writeHead(statusCode)
        res.end(payloadString)

        // Log the request path and its method, query strings parameters, headers and payload
        console.log(`Path: ${trimmedPath}\nMethod: ${method}\nQuery strings parameters:`, queryStringObject, `\nHeaders:`, headers, `\nPayload sent:`, buffer, '\nResponse status code:', statusCode, '\nResponse payload:', payloadString)
    })

})
```

Now we can test the same Postman POST request - we must receive a 404 staus code and a empty object.

And we also can create a new POST request, using `localhost:3000/sample` request (you can keep all other fields such as query strings, headers, etc.). The expected response will look like this:

```sh
Path: sample
Method: post
Query strings parameters: [Object: null prototype] { foo: 'bar', baz: 'true' }
Headers: {
  'user-agent': 'PostmanRuntime/7.26.8',
  accept: '*/*',
  'cache-control': 'no-cache',
  'postman-token': '1a23456b-789c-1011-d1ef-21g31h41i51j617',
  host: 'localhost:3000',
  'accept-encoding': 'gzip, deflate, br',
  connection: 'keep-alive',
  'content-length': '0'
}
Payload sent:
Response status code: 406
Response payload: {"name":"Sample handler"}
```

___

## Changelog

### v0.7.0 | Routes

**Features**

* Sample and notFound routes handlers added

* Documentation updated

### v0.6.0 | Payloads Parse

**Features**

* Payloads parsed using streams

* `res.end()` moved to inside the `req` `end` event

* Request log updated

* Documentation updated

### v0.5.0 | Request Headers Parse

**Features**

* Request headers parsed

* Request log updated

* Documentation updated

### v0.4.0 | Query Strings Parse

**Features**

* Query strings parsed

* Request log updated

* Documentation updated

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
