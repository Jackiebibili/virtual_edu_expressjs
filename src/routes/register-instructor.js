let express = require('express')
let path = require('path')
let router = express.Router()
let mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
let crypto = require('crypto')
let bodyParser = require('body-parser')
let urlencodedParser = bodyParser.urlencoded({extended : false})
const ObjetId = require('mongodb').ObjectID
let GridFsStorage = require('multer-gridfs-storage')
let Grid = require('gridfs-stream')
let multer = require('multer')
let uri = require('../config/keys.usaws').MongoURI


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


//POST to server --register the user with the info provided
router.post('/', upload.fields([{name: 'file0', maxCount: 1},
                                {name: 'file1', maxCount: 1},
                                {name: 'file2', maxCount: 1},
                                {name: 'file3', maxCount: 1}]),
    (req, res) => {
    let errors = []
    let CustomerModel = require('../models/register.instructor.model')
    var certificates = ["Teaching Certificate", "Academic Degree", "Skill Certificate", "Other Certificate"];
    instructorValidateSend()

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
                    console.log(req.body)
                    var files = []
                    var fileObj = req.files.file0;
                    if(typeof fileObj != 'undefined') {
                        files.push({"certificate_type": certificates[0], "certificate_id": fileObj[0].id});
                    }
                    fileObj = req.files.file1;
                    if(typeof fileObj != 'undefined') {
                        files.push({"certificate_type": certificates[1], "certificate_id": fileObj[0].id})
                    }
                    fileObj = req.files.file2;
                    if(typeof fileObj != 'undefined') {
                        files.push({"certificate_type": certificates[2], "certificate_id": fileObj[0].id})
                    }
                    fileObj = req.files.file3;
                    if(typeof fileObj != 'undefined') {
                        files.push({"certificate_type": req.body.customizedcertificatetype, "certificate_id": fileObj[0].id})
                    }
                    //res.json(req.files)
                    const newUser = new CustomerModel(req.body)
                    //hash password and replace the one in newUser with hash encoded
                    bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.userpassword, salt, (err, hash) => {
                    if(err) throw err
                    //set the hashed password to newUser
                    newUser.userpassword = hash
                    newUser.certificates_upload = files
                    //save the newUser
                    newUser.save()
                     .then(user => {
                        req.flash('success_msg', "You've sucessfully submitted the instructor application to our website. Upon approval, we'll notify you through the email you provided.")
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

