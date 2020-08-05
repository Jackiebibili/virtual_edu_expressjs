const mongoose = require('mongoose')
mongoose.connection.collection('Courses')

let CourseSchema = new mongoose.Schema({
    instructorId: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true
    },
    classmode: {
        type: String,
        required: true
    },
    classdateinterval: {
        type: Array,
        required: true
    },
    classdayschedule: {
        type: Array,
        required: true
    },
    classsessionchedule: {
        type: Array,
        required: true
    },
    classdatesoverview: {
        type: Array,
        required: true
    },
    enrollmentcap: {
        type: String,
        required: true
    },
    prerequisite: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    studentslistId: {
        type: String,
        required: true
    },
    creationdate: {
        type: String,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('Courses', CourseSchema)