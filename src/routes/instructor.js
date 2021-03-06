const express = require('express')
const router = express.Router()
const objectId = require('mongodb').ObjectID

//instructor dashboard
const { ensureAuthenticated } = require('../config/auth')
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard-instructor', {
        name: req.user.fullnametext,
        username: req.user.usernametext,
        lastLogin: req.user.lastLoginDate,
        accountCreated: req.user.creationDate
    })
})

//logout handle
router.get('/logout', ensureAuthenticated, (req, res) => {
    //record the last login time
    const instructorModel = require('../models/register.instructor.model')
    const lastLogin = req.user.currentLoginDate
    instructorModel.updateOne({"_id": objectId(req.user.id)}, {$set: {
        "currentLoginDate": "",
        "lastLoginDate": lastLogin
    }}, (err, result) => {
        if(err) throw err;
        console.log(result)
    })
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login')
})


module.exports = router
