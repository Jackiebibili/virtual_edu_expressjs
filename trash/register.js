let express = require('express')
let router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
let path = require('path')
let bodyParser = require('body-parser')
let urlencodedParser = bodyParser.urlencoded({extended : false})


router.get('/register', (req, res) => {
    res.render('sign_up_console')
})

//POST to server
let CustomerModel = null;
router.post('/register', urlencodedParser, (req, res) => {

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
    //validate repetitive users (keyword look up: email address)
    CustomerModel.findOne({useremail: req.body.useremail})
        .then(user => {
            if(user) {
                //the requested user has existed
                errors.push({ msg: 'Email is already registered'})
            } else {
                const newUser = new CustomerModel(req.body)
            }
        })
        //hash password and replace the one in newUser with hash encoded
        bcrypt.genSalt(10, (eer, salt) =>
         bcrypt.hash(newUser.userpassword, salt, (err, hash) => {
             if(err) throw err
             //set the hashed password to newUser
             newUser.userpassword = hash
             //save the newUser
             newUser.save()
                .then(user => {
                    req.flash('success_msg', 'You are now registered')
                    res.redirect('/users/login')
                })
                .catch(err => console.log(err))
         }))
    //res.render('register-success', {data: req.body})
})

module.exports = router