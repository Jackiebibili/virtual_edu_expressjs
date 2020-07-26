const LocalStrategy = require('passport-local').Strategy
//mongoose.connection.useDb('individual-instructors')
const bcrypt = require('bcryptjs')

//Load user model
const instructorModel = require('../models/register.instructor.model')
const studentModel = require('../models/register.student.model')
var objectId = require('mongodb').ObjectID
//const mongoose = require('mongoose')
//mongoose.connect('mongodb://localhost:27017')

function SessionConstructor(userId, userGroup, details)
{
    this.userId = userId;
    this.userGroup = userGroup;
    this.details = details;
}


module.exports = function(passport) {

    passport.serializeUser((user, done) => {
        let userGroup = "instructor"
        let userPrototype = Object.getPrototypeOf(user)
        if(userPrototype === instructorModel.prototype) {
            userGroup = "instructor"
        } else if(userPrototype === studentModel.prototype) {
            userGroup = "student"
        }

        let sessionConstructor = new SessionConstructor(user.id, userGroup, '')
        done(null, sessionConstructor);
      });
      
      passport.deserializeUser((sessionConstructor, done) => {
        if(sessionConstructor.userGroup == 'instructor') {
            instructorModel.findById(sessionConstructor.userId, (err, user) => {
                done(err, user)
            })
        } else if (sessionConstructor.userGroup == 'student') {
            studentModel.findById(sessionConstructor.userId, (err, user) => {
                done(err, user)
            })
        }
      });


    passport.use(
        'instructor-login', new LocalStrategy({ usernameField: 'email'}, function(email, password, done){
            //match user
            instructorModel.findOne({ useremail: email })
                .then(user => {
                    if(!user) {
                        return done(null, false, { message: 'That email is not registered'})
                    }

                    //match the password
                    bcrypt.compare(password, user.userpassword, (err, isMatch) => {
                        if(err) throw err;

                        if(isMatch) {
                            if(user.account_status == "Reviewing" || user.account_status == "reviewing")
                            {
                                return done(null, false, { message: "At this time, we're diligently reviewing your application to be an instructor in our website. Upon account approval, we will send an confirmation email to the email you provided, and you can activate your account from there."})
                            }
                            console.log(user.id)
                            //update the last login time
                            var date = Date.now()
                            instructorModel.updateOne({"_id": objectId(user.id)}, {$set: {"currentLoginDate": date}}, (err, result) => {
                                if(err) throw err;
                                console.log(result)
                            })
                            return done(null, user)
                        } else {
                            return done(null, false, { message: 'Password incorrect'})
                        }
                    })
                })
                .catch(err => console.log(err))
        })
    )
    passport.use(
        'student-login', new LocalStrategy({ usernameField: 'email'}, function(email, password, done){
            //match user
            studentModel.findOne({ useremail: email })
                .then(user => {
                    if(!user) {
                        return done(null, false, { message: 'That email is not registered'})
                    }

                    //match the password
                    bcrypt.compare(password, user.userpassword, (err, isMatch) => {
                        if(err) throw err;

                        if(isMatch) {
                            //update the last login time
                            var date = Date.now()
                            studentModel.updateOne({"_id": objectId(user.id)}, {$set: {"currentLoginDate": date}}, (err, result) => {
                                if(err) throw err;
                                console.log(result)
                            })
                            return done(null, user)
                        } else {
                            return done(null, false, { message: 'Password incorrect'})
                        }
                    })
                })
                .catch(err => console.log(err))
        })
    )


}