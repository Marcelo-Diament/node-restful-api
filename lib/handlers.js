/*
 * Request handlers
 */

// Dependencies
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
// @TODO Only let authenticated user access their own object. Don't let them access anyone object.
handlers._users.get = (data, callback) => {
  // Check that the phone number is valid
  const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length > 10 ? data.queryStringObject.phone.trim() : false
  if (phone) {
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
    callback(400, { 'Error': 'Missing required field' })
  }
}

// Users - put
// Required data: phone
// Optional data: firstName, lastName and/or password (at least one of them)
// @TODO Only let authenticated user update their own object. Don't let them update anyone object.
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
      callback(400, { 'Error': 'Missing fields to update' })
    }
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
}

// Users - delete
// Required data: phone
// Optional data: none
// @TODO Only let authenticated user delete their own object. Don't let them delete anyone object.
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
  // Check required field
  const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length > 10 ? data.payload.phone.trim() : false
  // Error if the phone is invalid
  if (phone) {
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
handlers._tokens.post = (data, callback) => {

}

// Tokens - get
handlers._tokens.get = (data, callback) => {

}

// Tokens - put
handlers._tokens.put = (data, callback) => {

}

// Tokens - delete
handlers._tokens.delete = (data, callback) => {

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