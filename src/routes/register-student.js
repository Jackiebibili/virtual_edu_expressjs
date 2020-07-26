let express = require('express')
let router = express.Router()
const bcrypt = require('bcryptjs')
let bodyParser = require('body-parser')
let urlencodedParser = bodyParser.urlencoded({extended : false})

//POST to server --register the user with the info provided
router.post('/', (req, res) => {
    let errors = []
    //choose the correct model to connect
    let CustomerModel = require('../models/register.student.model')
    studentValidateSend()

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
                    errors.push({ msg: 'Email is already registered'})
                    res.render('register', {
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
                    console.log(req.body)
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