let express = require('express')
expressLayouts = require('express-ejs-layouts')
let app = express()
let path = require('path')
let mongodb = require('mongodb')
mongoose = require('mongoose')
let flash = require('connect-flash')
let session = require('express-session')
let passport = require('passport')
let methodOverride = require('method-override')
let multer = require('multer')

//passport config
require('./config/passport')(passport)

//DB config
let uri = require('./config/keys.usaws').MongoURI


mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(() => console.log('===MongoDB connected==='))
    .catch(err => console.log(err))


//bodyparser
let bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))


//express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }))

//passport middlewares
app.use(passport.initialize());
app.use(passport.session());

//connect flash middleware
app.use(flash())

//global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')

    next()
})

//ejs
app.use(expressLayouts)
app.set('views',path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//register the routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/student', require('./routes/student'))
app.use('/instructor', require('./routes/instructor'))
//app.use('/instructor/dashboard', require('./routes/dashboard-instructor'))
app.use('/users/login', require('./routes/login'))
app.use('/users/register-instructor', require('./routes/register-instructor'))
app.use('/users/register-student', require('./routes/register-student'))
app.use('/users/collaborate', require('./routes/collaborate'))
app.use('/users/collaborate/classroom', require('./routes/classroom'))
app.use('/users/collaborate/playback', require('./routes/playback'))

//create a body(parsed json body property) with incoming call
app.use(bodyParser.json())
app.use(methodOverride('_method'))

app.use('/static', express.static(path.join(__dirname, 'public')));

//middleware = serially execute function,
//respond or pass it downstream to a series of function in the pipeline
app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`)
    next()  //otherwise the break the pipeline
})

app.use(express.static('src/public/html'))


//app.use(customerRoute)
//app.engine('html', require('ejs').renderFile);

//handler for 404 - resource not found
app.use((req, res, next) => {
    res.status(404).send('You are lost!')
})

//handler for error 500
app.use((err, req, res, next) => {
    console.error(err.stack)

    res.sendFile(path.join(__dirname, 'public/html/500.html'))

})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))


