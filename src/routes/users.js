let express = require('express')
let path = require('path')
let router = express.Router()
let mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
let crypto = require('crypto')
let bodyParser = require('body-parser')
let urlencodedParser = bodyParser.urlencoded({extended : false})
let mongodb = require('mongodb')
const ObjetId = require('mongodb').ObjectID
let GridFsStorage = require('multer-gridfs-storage')
let Grid = require('gridfs-stream')
let multer = require('multer')
let uri = require('../config/keys.usaws').MongoURI


router.get('/login', (req, res) => res.render('login'))
/*
//create storage engine
const conn = mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
let gfs;
conn.once('open', () => {
    //init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('instructor-certificate')
})


const filesFilter = (req, file, cb) => {
    if(file.mimetype === 'image/*' || file.mimetype === "application/pdf") {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
*/

const storage = new GridFsStorage({
    url: uri,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'instructor-certificate'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });




//POST to server --ajax test to see user availability
//1. phone number(phonetext itself)
//2. email address(useremail itself)
//3. username(usernametext itself)
router.get('/register', (req, res, next) => {
    let phone = req.query.phonetext
    if(phone) {
        //see if the phone number has registered in student database
        let Model = require('../models/register.student.model')
        Model.findOne({phonetext: phone})
            .then(user => {
                if(user) {
                    //the requested user exists
                    res.json({phonetext: phone, available: false})
                } else {
                    //see if the phone number has registered in instructor database
                    Model = require('../models/register.instructor.model')
                    Model.findOne({phonetext: phone})
                        .then(user => {
                            if(user) {
                                res.json({phonetext: phone, available: false})
                            } else {
                                res.json({phonetext: phone, available: true})
                            }
                        })
                }
            })
    } else {
        //return res.status(400).send('Illegal request')
        next()
    }
})

router.get('/register', (req, res, next) => {
    let email = req.query.useremail
    if(email) {
        //see if the email has registered in student database
        let Model = require('../models/register.student.model')
        Model.findOne({useremail: email})
            .then(user => {
                if(user) {
                    //the requested user exists
                    res.json({useremail: email, available: false})
                } else {
                    //see if the email has registered in instructor database
                    Model = require('../models/register.instructor.model')
                    Model.findOne({useremail: email})
                        .then(user => {
                            if(user) {
                                res.json({useremail: email, available: false})
                            } else {
                                res.json({useremail: email, available: true})
                            }
                        })
                }
            })
    } else {
        //return res.status(400).send('Illegal request')
        next()
    }})


router.get('/register', (req, res, next) => {
    //const usertypeOptions = ["selectanoption", "student", "instructor"]
    let username = req.query.usernametext
    let usertypeIndex = req.query.usertypeindex
    if(username && usertypeIndex) {
        if(usertypeIndex == "1") {
            //see if the username has registered in student database
            let Model = require('../models/register.student.model')
            Model.findOne({usernametext: username})
                .then(user => {
                    if(user) {
                        //the requested user exists
                        res.json({usernametext: username, available: false})
                    } else {
                        res.json({usernametext: username, available: true})
                    }   
                })
                .catch(err => {
                    res.json({error_code: "ERR_EMPTY_RESPONSE"})
                    /*
                    const errors = ["Please check your Internet connection, error code: ERR_EMPTY_RESPONSE"]
                    res.render('register', {    errors  })
                    */
                })
        } else if(usertypeIndex == "2") {
            //see if the username has registered in instructor database
            let Model = require('../models/register.instructor.model')
            Model.findOne({usernametext: username})
                .then(user => {
                    if(user) {
                        res.json({usernametext: username, available: false})
                    } else {
                        res.json({usernametext: username, available: true})
                    }
                })
                .catch(err => {
                    res.json({error_code: "ERR_EMPTY_RESPONSE"})
                    /*
                    const errors = ["Please check your Internet connection, error code: ERR_EMPTY_RESPONSE"]
                    res.render('register', {    errors  })
                    */
                })
        } else {
            return res.status(400).send('type out of bound')
        }
    } else {
        next()
    }
})


router.get('/register', (req, res) => res.render('register'))

/*
//POST to server --register the user with the info provided
let CustomerModel = null;
router.post('/register', upload.fields([{name: 'file0', maxCount: 1},
                                        {name: 'file1', maxCount: 1},
                                        {name: 'file2', maxCount: 1},
                                        {name: 'file3', maxCount: 1}]),
            (req, res) => {
    
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
                    errors.push({ msg: 'Email is already registered'})
                    res.render('register', {
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
                    var fileIds = []
                    var fileObj = req.files.file0;
                    if(typeof fileObj != 'undefined') {
                        fileIds.push(fileObj[0].id)
                    }
                    fileObj = req.files.file1;
                    if(typeof fileObj != 'undefined') {
                        fileIds.push(fileObj[0].id)
                    }
                    fileObj = req.files.file2;
                    if(typeof fileObj != 'undefined') {
                        fileIds.push(fileObj[0].id)
                    }
                    fileObj = req.files.file3;
                    if(typeof fileObj != 'undefined') {
                        fileIds.push(fileObj[0].id)
                    }
                    //res.json(req.files)
                    const newUser = new CustomerModel(req.body)
                    //hash password and replace the one in newUser with hash encoded
                    bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.userpassword, salt, (err, hash) => {
                    if(err) throw err
                    //set the hashed password to newUser
                    newUser.userpassword = hash
                    newUser.certificate_id = fileIds
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
*/
module.exports = router
