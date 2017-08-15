const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')

mongoose.connect('mongodb://localhost/loginapp')

let db = mongoose.connection

let UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    }, 
    email: {
        type: String
    },
    name: {
        type: String
    }
})

let User = module.exports = mongoose.model('User', UserSchema)

module.exports.createUser = (newUser, callback) => {
    bcrypt.genSalt(10, (err, salt)=> {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            // Store hash in your password DB.
            newUser.password = hash
            newUser.save(callback) 
        })
    })
}

module.exports.getUserByUsername = (username, callback) => {
    let query = { username: username }
    User.findOne(query, callback)
}

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err
        callback(null, isMatch)
    })
}

module.exports.getUserById = (id, callback) => {
    User.findById(id, callback)
}