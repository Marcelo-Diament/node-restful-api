/*
 * Library for storing and editing data
 *
 */

// Dependencies
const fs = require('fs'),
  path = require('path'),
  helpers = require('./helpers')

// Container for the module (to be exported)
const lib = {}

// Base directory of the folder
lib.baseDir = path.join(__dirname, '/../.data/')

// Write data to a file (inside a specific subfolder)
lib.create = (dir, file, data, callback) => {

  // Open the file for writing
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data)

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData, err => {
        if (!err) {
          fs.close(fileDescriptor, err => {
            if (!err) {
              callback(false)
            } else {
              callback('Error closing new file')
            }
          })
        } else {
          callback('Error writing to new file')
        }
      })
    } else {
      callback('Could not create new file, it may already exist')
    }
  })
}

// Read data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8', (err, data) => {
    if (!err) {
      const parsedData = helpers.parseJsonToObject(data)
      callback(false, parsedData)
    } else {
      callback(err, data)
    }
  })
}

// Update data inside a file
lib.update = (dir, file, data, callback) => {

  // Open the file for writing
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data)

      // Truncate this file
      fs.ftruncate(fileDescriptor, err => {
        if (!err) {
          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData, err => {
            if (!err) {
              fs.close(fileDescriptor, err => {
                if (!err) {
                  callback(false)
                } else {
                  callback('Error closing existing file')
                }
              })
            } else {
              callback('Error writing to existing file')
            }
          })
        } else {
          callback('Error truncating file')
        }
      })
    } else {
      callback('Could not open the file for update, it may not exist yet')
    }
  })
}

// Delete existing file
lib.delete = (dir, file, callback) => {
  // Unlink existing file
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, err => {
    if (!err) {
      callback(false)
    } else {
      callback('Error deleting file')
    }
  })
}

module.exports = lib