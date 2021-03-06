/*
 * Request handlers
 */

// Dependencies
const { callbackify } = require('util')
const _data = require('./data'),
  helpers = require('./helpers')

// Define the handlers
const handlers = {}

// Users handler
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback)
  } else {
    callback(405)
  }
}

// Container for users submethods
handlers._users = {}

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {

  // Check that all required fields are filled out
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false,
    lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false,
    phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length > 10 ? data.payload.phone.trim() : false,
    password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false,
    tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesn't already exist (by his phone number)
    _data.read('users', phone, (err, data) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password)

        // Create the user object
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            'tosAgreement': true
          }

          // Store the user
          _data.create('users', phone, userObject, err => {
            if (!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, { 'Error': 'Could not create the new user' })
            }
          })
        } else {
          callback(500, { 'Error': 'Could not hash the user\'s password' })
        }
      } else {
        callback(400, { 'Error': 'User already registered' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required fields' })
  }
}

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
  // Check that the phone number is valid
  const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length > 10 ? data.queryStringObject.phone.trim() : false
  if (phone) {
    // Get the token from the headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false

    // Verify if the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, (err, data) => {
          if (!err) {
            // Remove hashedPassword from the user object before returning it to the requester
            delete data.hashedPassword
            callback(200, data)
          } else {
            callback(404)
          }
        })
      } else {
        callback(403, { 'Error': 'Missing required token in header or token is invalid' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

// Users - put
// Required data: phone
// Optional data: firstName, lastName and/or password (at least one of them)
handlers._users.put = (data, callback) => {
  // Check required field
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length > 10 ? data.payload.phone.trim() : false

  // Check optional fields
  const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false,
    lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false,
    password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  // Error if the phone is invalid
  if (phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // Get the token from the headers
      const token = typeof (data.headers.token) == 'string' ? data.headers.token : false

      // Verify if the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, tokenIsValid => {
        if (tokenIsValid) {

          // Lookup the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // Update the necessary fields
              if (firstName)
                userData.firstName = firstName
              if (lastName)
                userData.lastName = lastName
              if (password)
                userData.hashedPassword = helpers.hash(password)

              // Store the new updates
              _data.update('users', phone, userData, err => {
                if (!err) {
                  callback(200)
                } else {
                  console.log(err)
                  callback(500, { 'Error': 'Could not update the user' })
                }
              })
            } else {
              callback(400, { 'Error': 'The specified user does not exist' })
            }
          })
        } else {
          callback(403, { 'Error': 'Missing required token in header or token is invalid' })
        }
      })
    } else {
      callback(400, { 'Error': 'Missing fields to update' })
    }
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

// Users - delete
// Required data: phone
// Optional data: none
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
  // Check required field
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length > 10 ? data.payload.phone.trim() : false
  // Error if the phone is invalid
  if (phone) {

    // Get the token from the headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false

    // Verify if the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
      if (tokenIsValid) {

        // Lookup the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            // Delete the user object
            _data.delete('users', phone, err => {
              if (!err) {
                callback(200)
              } else {
                console.log(err)
                callback(500, { 'Error': 'Could not delete the user' })
              }
            })
          } else {
            callback(400, { 'Error': 'The specified user does not exist' })
          }
        })
      } else {
        callback(403, { 'Error': 'Missing required token in header or token is invalid' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

// Tokens handler
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback)
  } else {
    callback(405)
  }
}

// Container for tokens submethods
handlers._tokens = {}

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length > 10 ? data.payload.phone.trim() : false,
    password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  if (phone && password) {
    // Lookup the user that matches that phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Hash the sent password, and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password)
        if (hashedPassword == userData.hashedPassword) {
          // If valid, create a new token with a random name. Set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20),
            expires = Date.now() + 1000 * 60 * 60,
            tokenObject = {
              phone,
              'id': tokenId,
              expires
            }

          _data.create('tokens', tokenId, tokenObject, err => {
            if (!err) {
              callback(200, tokenObject)
            } else {
              callback(500, { 'Error': 'Could not create the new token' })
            }
          })
        } else {
          callback(400, { 'Error': 'Access not allowed' })
        }
      } else {
        callback(400, { 'Error': 'Specified user not found' })
      }
    })
  } else {
    callback(400, { 'Error:': 'Missing required field(s)' })
  }
}

// Tokens - get
// Required data: ??d
// Optional data: none
handlers._tokens.get = (data, callback) => {
  // Check that the token id is valid
  const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
  if (id) {
    // Lookup the user
    _data.read('tokens', id, (err, tokenData) => {
      if (!err) {
        callback(200, tokenData)
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, {
      'Error': 'Missing required field'
    })
  }
}

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false,
    extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false

  if (id && extend) {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Checkt to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60

          // Store the new updates
          _data.update('tokens', id, tokenData, err => {
            if (!err) {
              callback(200)
            } else {
              callback(500, { 'Error': 'Could not update the token\'s expiration' })
            }
          })
        } else {
          callback(400, { 'Error': 'The token has already expired and cannot be extended' })
        }
      } else {
        callback(400, { 'Error': 'Specified token does not exist' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field(s) or field(s) are invalid' })
  }
}

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  // Check required field
  const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false
  // Error if the id is invalid
  if (id) {
    // Lookup the token
    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        // Delete the token object
        _data.delete('tokens', id, err => {
          if (!err) {
            callback(200)
          } else {
            console.log(err)
            callback(500, { 'Error': 'Could not delete the token' })
          }
        })
      } else {
        callback(400, { 'Error': 'The specified token does not exist' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check if the token is for the given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
}

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