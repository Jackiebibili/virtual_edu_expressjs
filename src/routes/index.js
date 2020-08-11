const express = require('express')
const path = require('path')
const router = express.Router()
const objectId = require('mongodb').ObjectID
const instructorModel = require('../models/register.instructor.model')
const courseModel = require('../models/createCourse.instructor.model')
const scheduleModel = require('../models/createSchedule.instructor.model')

//welcome page
router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/html/index.html')))

//constants
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

//indexing query
router.get('/search-instructors', (req, res) => {
    if(!req.query.searchtext) {
        return res.status(400).send("reqest body is missing.")
    } else {
        var regName = new RegExp(req.query.searchtext, "i");
        instructorModel.find({fullnametext: regName}, null, {sort: {fullnametext: 1}})
         .then(instructors => {
             if(instructors) {
                 var list = [];
                 getInstructors(0);
                function getInstructors(i) {
                    if(typeof instructors[i] != "undefined") {
                        //find the today schedule(chosen schedule)
                        if(typeof instructors[i].schedulechosen == "undefined" || instructors[i].schedulechosen == "") {
                            list.push({instructor: instructors[i], schedule: [], courses: []})
                            getInstructors(i + 1)
                        } else {
                            scheduleModel.findOne({"_id": objectId(instructors[i].schedulechosen)})
                            .then(schedule => {
                                //filter the schedule upto now
                                var now = Date.now();
                                var filteredSchedule = [];
                                schedule.schedulearray.forEach(sch => {
                                    if((new Date(sch[0])).getTime() - now > 0) {
                                        filteredSchedule.push(sch);
                                    }
                                })
                                //find the upcoming courses
                                var courseIds = instructors[i].coursearray;
                                var courseArray = [];
                                getCourses(courseIds, 0);
                                function getCourses(courseIds, index) {
                                    if(typeof courseIds[index] != "undefined") {
                                        courseModel.findOne({"_id": objectId(courseIds[index])})
                                        .then(course => {
                                            if(course) {
                                                courseArray.push(course)
                                                getCourses(courseIds, index + 1)
                                            }
                                        })
                                    } else {
                                        //save the info into an array
                                        list.push({instructor: instructors[i], schedule: filteredSchedule, courses: courseArray});
                                        getInstructors(i + 1);
                                    }
                                }
                            })    
                        }
                    } else {
                        res.render("search-instructor-name-result", {list})    
                    }
                }
             } else {
                 console.log("Nothing found")
             }
         })
         .catch(err => console.log(err))
    }
})

router.get('/search-courses', (req, res) => {
    if(!req.query.searchtext) {
        return res.status(400).send("reqest body is missing.")
    } else {
        var regCourse = new RegExp(req.query.searchtext, "i");
        courseModel.find({coursetitle: regCourse}, null, {sort: {coursetitle: 1}})
         .then(courses => {
             if(courses.length != 0) {
                 var list = [];
                 getCourses(0);
                 function getCourses(i) {
                     if(typeof courses[i] != "undefined") {
                        instructorModel.findOne({"_id": objectId(courses[i].instructorId)})
                        .then(instructor => {
                            if(instructor) {
                                if(typeof instructor.schedulechosen == "undefined" || instructor.schedulechosen == "") {
                                    list.push({instructor: instructor, schedule: [], course: courses[i]})
                                    getCourses(i + 1);
                                } else {
                                    //get the instructor's upcoming courses
                                    var courseIds = instructor.coursearray;
                                    var courseArray = [];
                                    getTitleCourses(courseIds, 0);
                                    function getTitleCourses(courseIds, index) {
                                        if(typeof courseIds[index] != "undefined") {
                                            courseModel.findOne({"_id": objectId(courseIds[index])})
                                            .then(course => {
                                                if(course) {
                                                    courseArray.push(course)
                                                    getTitleCourses(courseIds, index + 1)
                                                }
                                            })
                                        } else {
                                            //find the today's schedule
                                            scheduleModel.findOne({"_id": objectId(instructor.schedulechosen)})
                                             .then(schedule => {
                                                if(schedule) {
                                                    //filter the schedule upto now
                                                    var now = Date.now();
                                                    var filteredSchedule = [];
                                                    schedule.schedulearray.forEach(sch => {
                                                        if((new Date(sch[0])).getTime() - now > 0) {
                                                            filteredSchedule.push(sch);
                                                        }
                                                    })
                                                    list.push({instructor: instructor, schedule: filteredSchedule, courses: courseArray, course: courses[i]})
                                                    getCourses(i + 1);
                                                }
                                             })
                                        }
                                    }
                                }
                            }
                        })   
                     } else {
                         list.push(monthsArray)
                        res.render("search-course-title-result", {list});
                     }
                 }
             } else {
                 console.log("Nothing found")
             }
         })
         .catch(err => console.log(err))
    }
})

router.get('/search', (req, res) => {
    if(!req.query.searchtext) {
        return res.status(400).send("reqest body is missing.")
    } else {
        var category = req.query.r;
        if(category.toLowerCase() == "subjecttitle") {
            var regSubject = new RegExp(req.query.searchtext, "i");
            courseModel.find({subject: regSubject}, null, {sort: {subject: 1}})
             .then(subjects => {
                 if(subjects) {
                     var list = [];
                     getSubjects(0);
                     function getSubjects(i) {
                         if(typeof subjects[i] != "undefined") {
                            instructorModel.findOne({"_id": objectId(subjects[i].instructorId)})
                            .then(instructor => {
                                if(instructor) {
                                    if(typeof instructor.schedulechosen == "undefined" || instructor.schedulechosen == "") {
                                        list.push({instructor: instructor, schedule: [], course: subjects[i]})
                                        getSubjects(i + 1);
                                    } else {
                                        //get the instructor's upcoming courses
                                        var courseIds = instructor.coursearray;
                                        var courseArray = [];
                                        getCourses(courseIds, 0);
                                        function getCourses(courseIds, index) {
                                            if(typeof courseIds[index] != "undefined") {
                                                courseModel.findOne({"_id": objectId(courseIds[index])})
                                                .then(course => {
                                                    if(course) {
                                                        courseArray.push(course)
                                                        getCourses(courseIds, index + 1)
                                                    }
                                                })
                                            } else {
                                                //find the today's schedule
                                                scheduleModel.findOne({"_id": objectId(instructor.schedulechosen)})
                                                 .then(schedule => {
                                                    if(schedule) {
                                                        //filter the schedule upto now
                                                        var now = Date.now();
                                                        var filteredSchedule = [];
                                                        schedule.schedulearray.forEach(sch => {
                                                            if((new Date(sch[0])).getTime() - now > 0) {
                                                                filteredSchedule.push(sch);
                                                            }
                                                        })
                                                        list.push({instructor: instructor, schedule: filteredSchedule, courses: courseArray, course: subjects[i]})
                                                        getSubjects(i + 1);
                                                    }
                                                 })
                                            }
                                        }
                                    }
                                }
                            })   
                         } else {
                            list.push(monthsArray)
                            res.render("search-subject-category-result", {list, searchbarselectindex: 2, searchcontent: req.query.searchtext});
                         }
                     }
                 } else {
                     console.log("Nothing found")
                 }
             })
             .catch(err => console.log(err))
        } else if(category.toLowerCase() == "coursetitle") {
            var regCourse = new RegExp(req.query.searchtext, "i");
            courseModel.find({coursetitle: regCourse}, null, {sort: {coursetitle: 1}})
             .then(courses => {
                 if(courses.length != 0) {
                     var list = [];
                     getCourses(0);
                     function getCourses(i) {
                         if(typeof courses[i] != "undefined") {
                            instructorModel.findOne({"_id": objectId(courses[i].instructorId)})
                            .then(instructor => {
                                if(instructor) {
                                    if(typeof instructor.schedulechosen == "undefined" || instructor.schedulechosen == "") {
                                        list.push({instructor: instructor, schedule: [], course: courses[i]})
                                        getCourses(i + 1);
                                    } else {
                                        //get the instructor's upcoming courses
                                        var courseIds = instructor.coursearray;
                                        var courseArray = [];
                                        getTitleCourses(courseIds, 0);
                                        function getTitleCourses(courseIds, index) {
                                            if(typeof courseIds[index] != "undefined") {
                                                courseModel.findOne({"_id": objectId(courseIds[index])})
                                                .then(course => {
                                                    if(course) {
                                                        courseArray.push(course)
                                                        getTitleCourses(courseIds, index + 1)
                                                    }
                                                })
                                            } else {
                                                //find the today's schedule
                                                scheduleModel.findOne({"_id": objectId(instructor.schedulechosen)})
                                                 .then(schedule => {
                                                    if(schedule) {
                                                        //filter the schedule upto now
                                                        var now = Date.now();
                                                        var filteredSchedule = [];
                                                        schedule.schedulearray.forEach(sch => {
                                                            if((new Date(sch[0])).getTime() - now > 0) {
                                                                filteredSchedule.push(sch);
                                                            }
                                                        })
                                                        list.push({instructor: instructor, schedule: filteredSchedule, courses: courseArray, course: courses[i]})
                                                        getCourses(i + 1);
                                                    }
                                                 })
                                            }
                                        }
                                    }
                                }
                            })   
                         } else {
                             list.push(monthsArray)
                            res.render("search-course-title-result", {list, searchbarselectindex: 1, searchcontent: req.query.searchtext});
                         }
                     }
                 } else {
                     console.log("Nothing found")
                 }
             })
             .catch(err => console.log(err))    
        } else if(category.toLowerCase() == "instructorname") {
            var regName = new RegExp(req.query.searchtext, "i");
            instructorModel.find({fullnametext: regName}, null, {sort: {fullnametext: 1}})
             .then(instructors => {
                 if(instructors) {
                     var list = [];
                     getInstructors(0);
                    function getInstructors(i) {
                        if(typeof instructors[i] != "undefined") {
                            //find the today schedule(chosen schedule)
                            if(typeof instructors[i].schedulechosen == "undefined" || instructors[i].schedulechosen == "") {
                                list.push({instructor: instructors[i], schedule: [], courses: []})
                                getInstructors(i + 1)
                            } else {
                                scheduleModel.findOne({"_id": objectId(instructors[i].schedulechosen)})
                                .then(schedule => {
                                    //filter the schedule upto now
                                    var now = Date.now();
                                    var filteredSchedule = [];
                                    schedule.schedulearray.forEach(sch => {
                                        if((new Date(sch[0])).getTime() - now > 0) {
                                            filteredSchedule.push(sch);
                                        }
                                    })
                                    //find the upcoming courses
                                    var courseIds = instructors[i].coursearray;
                                    var courseArray = [];
                                    getCourses(courseIds, 0);
                                    function getCourses(courseIds, index) {
                                        if(typeof courseIds[index] != "undefined") {
                                            courseModel.findOne({"_id": objectId(courseIds[index])})
                                            .then(course => {
                                                if(course) {
                                                    courseArray.push(course)
                                                    getCourses(courseIds, index + 1)
                                                }
                                            })
                                        } else {
                                            //save the info into an array
                                            list.push({instructor: instructors[i], schedule: filteredSchedule, courses: courseArray});
                                            getInstructors(i + 1);
                                        }
                                    }
                                })    
                            }
                        } else {
                            res.render("search-instructor-name-result", {list, searchbarselectindex: 3, searchcontent: req.query.searchtext})    
                        }
                    }
                 } else {
                     console.log("Nothing found")
                 }
             })
             .catch(err => console.log(err))    
        } else if(category.toLowerCase() == "all") {

        }
    }
})

module.exports = router

