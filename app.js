const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
let LocalStrategy = require('passport-local'), Strategy

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/loginapp";

MongoClient.connect(url, function (err, db) {
    if (err) throw err
    console.log("Database created!")
})

const routes = require('./routes/index')
const users = require('./routes/users')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', exphbs({defaultLayout: 'layout'}))
app.set('view engine', 'handlebars')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']'
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        }
    }
}))

app.use(flash())

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next()
})

app.use('/', routes)
app.use('/users', users)

app.set('port', (process.env.PORT || 9008))

app.listen(app.get('port'), () => {
    console.log('Server running at : ' + app.get('port'))
})