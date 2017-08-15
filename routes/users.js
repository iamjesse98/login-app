const express = require('express')
const router = express.Router()

const passport = require('passport')
let LocalStrategy = require('passport-local'), Strategy

let User = require('../models/user')

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/register', (req, res) => {
    let name = req.body.name
    let username = req.body.username
    let email = req.body.email
    let password = req.body.password
    let password1 = req.body.password1

    // console.log(name, pass)

    // validation
    req.checkBody('name', 'name is required').notEmpty()
    req.checkBody('username', 'username is required').notEmpty()
    req.checkBody('email', 'email is required').notEmpty()
    req.checkBody('email', 'email is not valid').isEmail()
    req.checkBody('password', 'password is required').notEmpty()
    req.checkBody('password1', 'passwords do not match').equals(req.body.password)
    
    let errors = req.validationErrors()

    if(errors) {
        res.render('register', {
            errors: errors
        })
    }else{
        // console.log('passed')
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        })

        User.createUser(newUser, (err, user) => {
            if(err) throw err
           // console.log(user)
        })

        req.flash('success_msg', 'you are registered and can now log in.')
        res.redirect('/users/login')
    }
})


passport.use(new LocalStrategy(
    function (username, password, done) {
            User.getUserByUsername(username, (err, user) => {
                if(err) throw err
                if(!user) return done(null, false, {message: 'unknown user'})
                User.comparePassword(password, user.password, (err, isMatch) => {
                    if(err) throw err
                    if(isMatch){
                        return done(null, user)
                    }else{
                        return dne(null, false, {message: 'Invalid Password'})
                    }
                })
            })
    }
))

passport.serializeUser(function (user, done) {
    done(null, user.id)
})

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user)
    })
})

router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }), (req, res) => {
        res.redirect('/')
})

router.get('/logout', (req, res) => {
    req.logout()

    req.flash('success_msg', 'You are logged out')

    res.redirect('/users/login')
})

module.exports = router