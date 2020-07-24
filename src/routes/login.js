const express = require('express')

const router = express.Router()
const passport = require('passport')

router.get('/instructor', (req, res) => res.render('login-instructor'))
router.get('/student', (req, res) => res.render('login-student'))


//login instructor handle
router.post('/instructor', (req, res, next) => {
    passport.authenticate('instructor-login', {
        successRedirect: '/instructor/dashboard',
        failureRedirect: '/users/login/instructor',
        failureFlash: true
    })(req, res, next)
})

//login student handle
router.post('/student', (req, res, next) => {
    passport.authenticate('student-login', {
        successRedirect: '/student/dashboard',
        failureRedirect: '/users/login/student',
        failureFlash: true
    })(req, res, next)
})

module.exports = router