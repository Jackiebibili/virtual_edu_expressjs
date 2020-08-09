const mongoose = require('mongoose')
mongoose.connection.collection('Enrolled-lists')

let StudentsListSchema = new mongoose.Schema({
    studentslist: {
        type: Array,
        required: true,
        default: [],
        unique: false
    },
    courseId: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('Enrolled-lists', StudentsListSchema)