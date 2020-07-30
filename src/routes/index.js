const express = require('express')
const path = require('path')
const router = express.Router()


//welcome page
router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/html/index.html')))

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

