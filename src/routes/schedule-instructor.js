const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const objectId = require('mongodb').ObjectID
const { ensureAuthenticated } = require('../config/auth')
const instructorModel = require('../models/register.instructor.model')
const courseModel = require('../models/createCourse.instructor.model')
const scheduleModel = require('../models/createSchedule.instructor.model')

router.get('/create', ensureAuthenticated, (req, res) => res.render('createSchedule-instructor'))



router.get('/create-schedule', ensureAuthenticated, (req, res) => {
    instructorModel.findOne({ "_id": objectId(req.user.id) })
        .then(instructor => {
            if (instructor) {
                //get the course id array
                var courseIds = instructor.coursearray;
                var courseArray = [];
                var now = Date.now();
                getCourses(0);
                function getCourses(index) {
                    if (typeof courseIds[index] != "undefined") {
                        courseModel.findOne({ "_id": objectId(courseIds[index]) })
                            .then(course => {
                                if (course) {
                                    if (new Date(course.sessioninterval[0]).getTime() - now > 0) {
                                        courseArray.push(course);
                                    }
                                    getCourses(index + 1);
                                }
                            })
                    } else {
                        //send the info
                        res.json({ courses: courseArray });
                    }
                }
            }
        })

})



router.post('/create-schedule', ensureAuthenticated, (req, res) => {
    let ScheduleModel = require('../models/createSchedule.instructor.model')
    if (!req.body) {
        return res.status(400).send('Request body is missing')
    } else {
        const newSchedule = new ScheduleModel(req.body);
        newSchedule.schedulearray = JSON.parse(req.body.schedulearray);
        newSchedule.daynumberslist = JSON.parse(req.body.dayslist);
        newSchedule.instructorId = req.user.id;
        newSchedule.save()
            .then(schedule => {
                var scheduleId = req.user.scheduleId;
                if (typeof scheduleId == "undefined") {
                    scheduleId = [];
                }
                scheduleId.push(schedule.id);
                instructorModel.updateOne({ "_id": objectId(req.user.id) }, {
                    $set: {
                        "scheduleId": scheduleId
                    }
                }, (err, result) => {
                    if (err) throw err;
                    console.log(result)
                })
                res.send("Schedule Uploaded!");
            })
            .catch(err => console.log(err))
    }
})


router.get('/view', ensureAuthenticated, (req, res) => {
    var scheduleList = [];
    getSchedule(req.user.scheduleId, 0);
    function getSchedule(scheduleId, index) {
        if (scheduleId[index]) {
            scheduleModel.findOne({ "_id": objectId(scheduleId[index]) })
                .then(schedule => {
                    if (schedule) {
                        scheduleList.push(schedule);
                        getSchedule(scheduleId, index + 1);
                    }
                })
        } else {
            var i = 0;
            var list = [];
            scheduleList.forEach(schedule => {
                list.push([new Date(schedule.schedulearray[0][0]), new Date(schedule.schedulearray[0][1])]);  //[min, max]
                for (var j = 0; j < schedule.schedulearray.length; j++) {
                    var currStart = new Date(schedule.schedulearray[j][0]);
                    if (currStart.getTime() < list[i][0].getTime()) {
                        list[i][0] = currStart;
                    }
                    var currEnd = new Date(schedule.schedulearray[j][1]);
                    if (currEnd.getTime() > list[i][1].getTime()) {
                        list[i][1] = currEnd;
                    }
                }
                i++;
            });
            res.render('viewSchedule-instructor', { scheduleList, list })
        }
    }
})

router.get('/remove-schedule', ensureAuthenticated, (req, res) => {
    if (!req.query) {
        return res.status(400).send('Request body is missing')
    } else {
        //modify the instructor's chosen schedule and saved schedule list
        instructorModel.findOne({ "_id": objectId(req.user.id) })
            .then(user => {
                if (user) {
                    var scheduleList = user.scheduleId;
                    var scheduleChosen = user.schedulechosen;
                    if (scheduleChosen == req.query.scheduleid) {
                        scheduleChosen = "";
                    }
                    var index = scheduleList.indexOf(req.query.scheduleid);
                    if (index != -1) {
                        scheduleList.splice(index, 1);
                        instructorModel.updateOne({ "_id": objectId(req.user.id) }, {
                            $set: {
                                "scheduleId": scheduleList,
                                "schedulechosen": scheduleChosen
                            }
                        }, (err, result) => {
                            if (err) throw err;
                            console.log(result)
                            //delete the schedule item (doc)
                            scheduleModel.deleteOne({ "_id": objectId(req.query.scheduleid) }, (err, result) => {
                                if (err) throw err;
                                console.log(result)
                                res.json({ deleted: true });
                            })
                        })

                    }
                }
            })
    }
})


router.get('/view-schedule', ensureAuthenticated, (req, res) => {
    if (!req.query) {
        return res.status(400).send('Request body is missing')
    } else {
        scheduleModel.findOne({ "_id": objectId(req.query.scheduleid) })
            .then(schedule => {
                if (schedule) {
                    instructorModel.findOne({ "_id": objectId(req.user.id) })
                        .then(user => {
                            if (user) {
                                var courseArray = user.coursearray;
                                var courseContentArray = [];
                                var now = Date.now();
                                getCourses(0);
                                function getCourses(index) {
                                    if (typeof courseArray[index] != "undefined") {
                                        courseModel.findOne({ "_id": courseArray[index] })
                                            .then(course => {
                                                if (course) {
                                                    if (new Date(course.sessioninterval[0]).getTime() - now > 0) {
                                                        courseContentArray.push(course);
                                                    }
                                                    getCourses(index + 1);
                                                }
                                            })
                                    } else {
                                        res.json({ schedule: schedule, courses: courseContentArray });
                                    }
                                }
                            }
                        })
                }
            })
    }
})

router.post('/view', ensureAuthenticated, (req, res) => {
    if (!req.body) {
        return res.status(400).send('Request body is missing')
    } else {
        if (req.body.newtimeslot) {
            scheduleModel.findOne({ "_id": objectId(req.body.scheduleid) })
                .then(schedule => {
                    if (schedule) {
                        var temp = schedule.schedulearray;
                        var newAddedTimeSlot = JSON.parse(req.body.newtimeslot);
                        temp.push(newAddedTimeSlot);
                        //update the schedule
                        scheduleModel.updateOne({ "_id": objectId(req.body.scheduleid) }, {
                            $set: {
                                "schedulearray": temp
                            }
                        }, (err, result) => {
                            if (err) throw err;
                            console.log(result)
                            res.render("viewSchedule-instructor")
                        })
                    }
                })
        } else {
            scheduleModel.updateOne({ "_id": objectId(req.body.scheduleId) }, {
                $set: {
                    "scheduletitle": req.body.scheduletitle,
                    "scheduledescription": req.body.scheduledescription,
                    "schedulearray": JSON.parse(req.body.schedulearray)
                }
            }, (err, result) => {
                if (err) throw err;
                console.log(result)
                res.render("viewSchedule-instructor")
            })
        }
    }
})


router.get('/choose', ensureAuthenticated, (req, res) => {
    var scheduleList = [];
    getSchedule(req.user.scheduleId, 0);
    function getSchedule(scheduleId, index) {
        if (scheduleId[index]) {
            scheduleModel.findOne({ "_id": objectId(scheduleId[index]) })
                .then(schedule => {
                    if (schedule) {
                        scheduleList.push(schedule);
                        getSchedule(scheduleId, index + 1);
                    }
                })
        } else {
            var i = 0;
            var list = [];
            scheduleList.forEach(schedule => {
                list.push([new Date(schedule.schedulearray[0][0]), new Date(schedule.schedulearray[0][1])]);  //[min, max]
                for (var j = 0; j < schedule.schedulearray.length; j++) {
                    var currStart = new Date(schedule.schedulearray[j][0]);
                    if (currStart.getTime() < list[i][0].getTime()) {
                        list[i][0] = currStart;
                    }
                    var currEnd = new Date(schedule.schedulearray[j][1]);
                    if (currEnd.getTime() > list[i][1].getTime()) {
                        list[i][1] = currEnd;
                    }
                }
                i++;
            });
            var selectedScheduleId = req.user.schedulechosen;
            res.render('chooseSchedule-instructor', { scheduleList, list, selectedScheduleId })
        }
    }
})

router.post('/choose', ensureAuthenticated, (req, res) => {
    if (!req.body) {
        return res.status(400).send('Request body is missing')
    } else {
        instructorModel.updateOne({ "_id": objectId(req.user.id) }, {
            $set: {
                "schedulechosen": req.body.selectascheduleradiogroup
            }
        }, (err, result) => {
            if (err) throw err;
            console.log(result)
            var scheduleList = [];
            getSchedule(req.user.scheduleId, 0);
            function getSchedule(scheduleId, index) {
                if (scheduleId[index]) {
                    scheduleModel.findOne({ "_id": objectId(scheduleId[index]) })
                        .then(schedule => {
                            if (schedule) {
                                scheduleList.push(schedule);
                                getSchedule(scheduleId, index + 1);
                            }
                        })
                } else {
                    var i = 0;
                    var list = [];
                    scheduleList.forEach(schedule => {
                        list.push([new Date(schedule.schedulearray[0][0]), new Date(schedule.schedulearray[0][1])]);  //[min, max]
                        for (var j = 0; j < schedule.schedulearray.length; j++) {
                            var currStart = new Date(schedule.schedulearray[j][0]);
                            if (currStart.getTime() < list[i][0].getTime()) {
                                list[i][0] = currStart;
                            }
                            var currEnd = new Date(schedule.schedulearray[j][1]);
                            if (currEnd.getTime() > list[i][1].getTime()) {
                                list[i][1] = currEnd;
                            }
                        }
                        i++;
                    });
                    var selectedScheduleId = req.body.selectascheduleradiogroup;
                    res.render("chooseSchedule-instructor", { scheduleList, list, confirmSelected: "You've successfully put a schedule into effect!", selectedScheduleId })
                }
            }
        })
    }
})

module.exports = router

