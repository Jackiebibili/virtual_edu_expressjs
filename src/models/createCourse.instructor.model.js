const mongoose = require('mongoose')
mongoose.connection.collection('Courses')

let CourseSchema = new mongoose.Schema({
    instructorId: {
        type: String,
        required: true,
        unique: false
    },
    subject: {
        type: Array,
        required: true,
        unique: false
    },
    enrollmentcap: {
        type: String,
        required: true,
        unique: false
    },
    coursetitle: {
        type: String,
        required: true,
        unique: false
    },
    coursedescription: {
        type: String,
        required: true,
        unique: false
    },
    sessioninterval: {
        type: Array,
        required: true,
        unique: false
    },
    studentslistId: {
        type: String,
        required: false,
        default: "",
        unique: true
    },
    creationdate: {
        type: String,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('Courses', CourseSchema)
