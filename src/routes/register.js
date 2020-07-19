let express = require('express')
let router = express.Router()
let path = require('path')
let bodyParser = require('body-parser')
let urlencodedParser = bodyParser.urlencoded({extended : false})


router.get('/register', (req, res) => {
    //res.sendFile(path.join(__dirname, '../public/html/sign_up_console.html'))
    res.render('sign_up_console')
})

//POST to server
let CustomerModel = null;
router.post('/register', urlencodedParser, (req, res) => {
    /*
    if(req.body.usertypeselection == "student")
    {
        CustomerModel = require('../models/register.student.model');
    }
    else if(req.body.usertypeselection == "instructor")
    {
        CustomerModel = require('../models/register.instructor.model');
    }
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
        */
    res.render('register-success', {data: req.body})
})

module.exports = router