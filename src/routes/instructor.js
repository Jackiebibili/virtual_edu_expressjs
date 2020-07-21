const express = require('express')
const router = express.Router()


//instructor dashboard
const { ensureAuthenticated } = require('../config/auth')
router.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', {
        name: req.user.usernametext
    }))

module.exports = router
