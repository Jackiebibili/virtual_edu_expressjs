let express = require('express')
let router = express.Router()
let path = require('path')
let app = express()

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/sign_up_console.html'))
})

//POST to server
let CustomerModel = require('../models/register.student.model')
app.post('/register', (req, res) => {
    console.log(req.body);
    if(!req.body){
        return res.status(400).send('Request body is missing')
    }
    let model = new CustomerModel(req.body)
    model.save()
        .then(doc => {//if not able to save the info 
            if(!doc || doc.length === 0) {
                return res.status(500).send(doc)
            }
            res.status(201).send(doc)
        })
        .catch(err => {
            res.status(500).json(err)
        })

})

module.exports = router