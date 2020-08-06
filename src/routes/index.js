const express = require('express')
const path = require('path')
const router = express.Router()


//welcome page
router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/html/index.html')))

router.get('/add-class', (req, res) => res.render('createSchedule-instructor'))

router.post('/create-schedule', (req, res) => {
    let ScheduleModel = require('../models/createSchedule.instructor.model')
    if(!req.body){
        return res.status(400).send('Request body is missing')
    } else {
        const newSchedule = new ScheduleModel(req.body);
        newSchedule.schedulearray = JSON.parse(req.body.schedulearray);
        newSchedule.save()
         .then(schedule => {
             res.send("Schedule Uploaded!");
         })
         .catch(err => console.log(err))
    }
})

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

