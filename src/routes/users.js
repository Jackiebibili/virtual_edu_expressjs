let express = require('express')
let router = express.Router()
const bcrypt = require('bcryptjs')
let bodyParser = require('body-parser')
let urlencodedParser = bodyParser.urlencoded({extended : false})

router.get('/login', (req, res) => res.render('login'))
router.get('/register', (req, res) => res.render('sign_up_console'))

//const studentUser = require('../config/config.student').studentObj
//const indivInstrucUser = require('../config/config.indiv.instructor').individualInstructorObj
//const orgInstrucUser = require('../config/config.org.instructor').organzatinoalInstructorObj


//POST to server
let CustomerModel = null;
router.post('/register', (req, res) => {
    let errors = []
    //choose the correct model to connect
    if(req.body.usertypeselection == "student")
    {
        CustomerModel = require('../models/register.student.model')
        studentValidateSend()
    }
    else if(req.body.usertypeselection == "instructor")
    {
        CustomerModel = require('../models/register.instructor.model')
        instructorValidateSend()
    }
    else
    {
        return res.status(400).send('invalid user type selection')
    }



    function studentValidateSend(){
        if(!req.body){
            return res.status(400).send('Request body is missing')
        }
        const {
            fullnametext,
            regioncode,
            phonetext,
            useremail,
            usertypeselection,
            gradelevelselect,
            yearofbirthselect,
            usernametext,
            userpassword
        } = req.body

        //validate repetitive users (keyword look up: email address)
        CustomerModel.findOne({useremail: req.body.useremail})
            .then(user => {
                if(user) {
                    //the requested user has existed
                    console.log(user)
                    errors.push({ msg: 'Email is already registered'})
                    console.log(req.body)
                    res.render('sign_up_console', {
                        errors,
                        fullnametext,
                        regioncode,
                        phonetext,
                        useremail,
                        usertypeselection,
                        gradelevelselect,
                        yearofbirthselect,
                        usernametext,
                        userpassword            
                    })
                } else {
                    const newUser = new CustomerModel(req.body)
                    //hash password and replace the one in newUser with hash encoded
                    bcrypt.genSalt(10, (err, salt) =>
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
            }
        //res.render('register-success', {data: req.body})
        })
    }



    function instructorValidateSend(){
        if(!req.body){
            return res.status(400).send('Request body is missing')
        }
        const {
            fullnametext,
            regioncode,
            phonetext,
            useremail,
            usertypeselection,
            typeofinstructorselect,
            degreeselection,
            institutionnametext,
            institutiontypeselection,
            roleselection,
            usernametext,
            userpassword
            } = req.body

        //validate repetitive users (keyword look up: email address)
        CustomerModel.findOne({useremail: req.body.useremail})
            .then(user => {
                if(user) {
                    //the requested user has existed
                    console.log(user)
                    errors.push({ msg: 'Email is already registered'})
                    console.log(req.body)
                    res.render('sign_up_console', {
                        errors,
                        fullnametext,
                        regioncode,
                        phonetext,
                        useremail,
                        usertypeselection,
                        typeofinstructorselect,
                        degreeselection,
                        institutionnametext,
                        institutiontypeselection,
                        roleselection,
                        usernametext,
                        userpassword
                    })
                } else {
                    const newUser = new CustomerModel(req.body)
                    //hash password and replace the one in newUser with hash encoded
                    bcrypt.genSalt(10, (err, salt) =>
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
            }
        //res.render('register-success', {data: req.body})
        })
    }
})

module.exports = router
