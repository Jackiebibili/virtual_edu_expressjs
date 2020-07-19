let express = require('express')
let app = express()
let registerRoute = require('./routes/register')
//let customerRoute = require('./routes/customer')
let path = require('path')
let bodyParser = require('body-parser')

//create a body(parsed json body property) with incoming call
app.use(bodyParser.json())

app.use('/static', express.static(path.join(__dirname, 'public')));

//middleware = serially execute function,
//respond or pass it downstream to a series of function in the pipeline
app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`)
    next()  //otherwise the break the pipeline
})

app.use(express.static('src/public/html'))


app.use(registerRoute)
//app.use(customerRoute)

//handler for 404 - resource not found
app.use((req, res, next) => {
    res.status(404).send('You are lost!')
})

//handler for error 500
app.use((err, req, res, next) => {
    console.error(err.stack)

    res.sendFile(path.join(__dirname, '../public/html/500.html'))

})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))


