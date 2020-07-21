const express = require('express')

const router = express.Router()


//welcome page
router.get('/', (req, res) => res.render('welcome'))

/*
//student dashboard
const { ensureAuthenticated } = require('../config/auth-student')
router.get('/dashboard', ensureAuthenticated, (req, res) => 
    res.render('dashboard', {
        name: req.user.name
    }))

//instructor dashboard
const { ensureAuthenticated } = require('../config/auth-instructor')
router.get('/instructor-dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', {
        name: req.user.name
    }))
*/
module.exports = router

