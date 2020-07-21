const LocalStrategy = require('passport-local').Strategy
//mongoose.connection.useDb('individual-instructors')
const bcrypt = require('bcryptjs')

//Load user model
const instructorModel = require('../models/register.instructor.model')
const studentModel = require('../models/register.student.model')

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
        /*
        User.findById(id, (err, user) => {
          done(err, user);
        });      */
      });


    passport.use(
        'instructor-signup', new LocalStrategy({ usernameField: 'email'}, function(email, password, done){
            //match user
            instructorModel.findOne({ useremail: email })
                .then(user => {
                    console.log(user)
                    if(!user) {
                        return done(null, false, { message: 'That email is not registered'})
                    }

                    //match the password
                    bcrypt.compare(password, user.userpassword, (err, isMatch) => {
                        if(err) throw err;
                        console.log(isMatch)

                        if(isMatch) {
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
        'student-signup', new LocalStrategy({ usernameField: 'email'}, function(email, password, done){
            //match user
            studentModel.findOne({ useremail: email })
                .then(user => {
                    console.log(user)
                    if(!user) {
                        return done(null, false, { message: 'That email is not registered'})
                    }

                    //match the password
                    bcrypt.compare(password, user.userpassword, (err, isMatch) => {
                        if(err) throw err;
                        console.log(isMatch)
                        if(isMatch) {
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