const mongoose = require('mongoose')
mongoose.connection.collection('Enrolled-lists')

let StudentsListSchema = new mongoose.Schema({
    studentslist: {
        type: Array,
        required: true,
    },
    courseId: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Enrolled-lists', StudentsListSchema)