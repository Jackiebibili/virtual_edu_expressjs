const mongoose = require('mongoose')
mongoose.connection.collection('Instructor-Schedules')

let ScheduleSchema = new mongoose.Schema({
    instructorId: {
        type: String,
        required: false
    },
    scheduletitle: {
        type: String,
        required: true,
        unique: false
    },
    scheduledescription: {
        type: String,
        required: true,
        unique: false
    },
    schedulearray: {
        type: Array,
        required: true,
        default: [],
        unique: false
    },
    dailytimeinterval: {
        type: Array,
        required: true,
        default: [],
        unique: false
    },
    daynumberslist: {
        type: Array,
        required: true,
        default: [],
        unique: false
    },
    creationdate: {
        type: String,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('Instructor-Schedules', ScheduleSchema)
