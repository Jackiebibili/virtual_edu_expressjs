const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const objectId = require('mongodb').ObjectID
const { ensureAuthenticated } = require('../config/auth')
const instructorModel = require('../models/register.instructor.model')
const courseModel = require('../models/createCourse.instructor.model')
const scheduleModel = require('../models/createSchedule.instructor.model')
const studentListModel = require('../models/students.list.model')

router.get('/create', ensureAuthenticated, (req, res) => res.render("createCourse-instructor"))

router.get('/schedule', ensureAuthenticated, (req, res) => {
    //get the chosen schedule of the instructor
    instructorModel.findOne({"_id": objectId(req.user.id)})
     .then(user => {
         if(user) {
             //find the schedule object by the schedule id
            scheduleModel.findOne({"_id": objectId(user.schedulechosen)})
             .then(schedule => {
                 if(schedule) {
                     var scheduleList = schedule.schedulearray;
                     //sort the schedule in ascending order
                     scheduleList.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
                     //filter out used time slots
                     var scheduleFilteredList = [];
                     scheduleList.forEach(schedule => {
                         if(typeof schedule[2] == 'undefined') {
                            scheduleFilteredList.push(schedule);
                         }
                     })
                     res.json({scheduleArray: scheduleFilteredList})
                 }
             })
             .catch(err => {
                 throw err
             }) 
         }
     })
     .catch(err => {
         throw err
     })
})


router.post('/create-course', ensureAuthenticated, (req, res) => {
    if(!req.body) {
        return res.status(400).send('Request body is missing')
    } else {
        var courseSession = JSON.parse(req.body.courseSession);
        //create the course
         const newCourse = new courseModel()
         newCourse.instructorId = req.user.id
         newCourse.subject = JSON.parse(req.body.courseSubject)
         newCourse.enrollmentcap = req.body.enrollmentCap
         newCourse.coursetitle = req.body.courseTitle
         newCourse.coursedescription = req.body.courseDescription
         newCourse.sessioninterval = courseSession
         
         newCourse.save()
          .then(course => {
            //create a student list
            const newStudentList = new studentListModel()
            newStudentList.courseId = course.id
            newStudentList.save()
             .then(studentList => {
                courseModel.updateOne({"_id": objectId(course.id)}, {$set: {
                    "studentslistId": studentList.id
                }}, (err, result) => {
                    if(err) throw err
                    console.log(result)
                    //find the chosen schedule id
                    instructorModel.findOne({"_id": objectId(req.user.id)})
                    .then(user => {
                     if(user) {
                        scheduleModel.findOne({"_id": objectId(user.schedulechosen)})
                            .then(schedule => {
                                var scheduleArray = schedule.schedulearray;
                                for(var i = 0; i < scheduleArray.length; i++) {
                                    if((new Date(scheduleArray[i][0]).getTime() - new Date(courseSession[0]).getTime()) == 0 && (new Date(scheduleArray[i][1]).getTime() - new Date(courseSession[1]).getTime()) == 0) {
                                        scheduleArray[i].push(course.id)
                                        break;
                                    }
                                }
                                //mark the corresponding schedule in schedule object
                                scheduleModel.updateOne({"_id": objectId(schedule.id)}, {$set: {
                                    "schedulearray": scheduleArray
                                }}, (err, result) => {
                                    if(err) throw err;
                                    console.log(result)
                                    var userCoursesList = user.coursearray;
                                    userCoursesList.push(course.id)
                                    //update the instructor's course id array
                                    instructorModel.updateOne({"_id": objectId(req.user.id)}, {$set: {
                                        "coursearray": userCoursesList
                                    }}, (err, result) => {
                                        if(err) throw err
                                        console.log(result)
                                        res.render("createCourse-instructor")
                                    })
                                })
                            })
                            .catch(err => console.log(err))
                     }
                    })
                    .catch(err => console.log(err))
                })
             })
             .catch(err => console.log(err))
          })
          .catch(err => console.log(err))

    }
})

router.get('/view-upcoming', ensureAuthenticated, (req, res) => {
    const subjectsArray = [{parent: "English or Language Arts", list: ["Literature", "Speech", "Composition"]},
                            {parent: "Mathematics", list: ["Algebra I", "Algebra II", "Geometry", "Statistics", "Trigonometry", "Pre-Calculus", "Calculus"]},
                            {parent: "Science", list: ["Biology", "Psychology", "Chemistry", "Geology", "Enviromental Science", "Physics I", "Physics II"]},
                            {parent: "Social Studies", list: ["Micro Economics", "Macro Economics", "Geography", "US Government", "US History I", "US History II", "World History"]},
                            {parent: "Foreign Languages", list: ["French I", "French II", "German I", "German II", "Spanish I", "Spanish II", "Japanese I", "Japanese II", "Mandarin I", "Mandarin II"]},
                            {parent: "Arts", list: ["Music", "Performing Art", "Choris"]}];
    const monthsArray = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
        ];
    instructorModel.findOne({"_id": objectId(req.user.id)})
     .then(user => {
        if(user) {
            //get the course array in instructor's object
            var coursesArray = user.coursearray;
            var courseContentList = [];
            getCourses(coursesArray, 0);
            function getCourses(courseArray, index) {
                if(typeof courseArray[index] != "undefined") {
                    //get the course object
                    courseModel.findOne({"_id": objectId(courseArray[index])})
                     .then(course => {
                         if(course) {
                            courseContentList.push(course)
                            getCourses(courseArray, index + 1)
                         }
                     })
                } else {
                    //send the course list with filtered results
                    var courseFilteredList = [];
                    var now = Date.now();
                    courseContentList.forEach(c => {
                        //if start time is already past
                        if(new Date(c.sessioninterval[0]) - now > 0) {
                            courseFilteredList.push(c)
                        }
                    })
                    res.render("viewUpcomingCourses-instructor", {courses: courseFilteredList, subjects: subjectsArray, months: monthsArray})
                }
            }        
        }
     })
    
})



module.exports = router