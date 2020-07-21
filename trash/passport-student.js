const LocalStrategy = require('passport-local').Strategy
//mongoose.connection.useDb('students')
const bcrypt = require('bcryptjs')

//Load user model
const User = require('../src/models/register.student.model')

module.exports = function(passport) {
    passport.use(
        'student-signup', new LocalStrategy({ usernameField: 'email'}, function(email, password, done){
            //match user
            User.findOne({ useremail: email })
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
    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
          done(err, user);
        });
      });
}