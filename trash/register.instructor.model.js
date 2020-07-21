//let mongoose = require('mongoose');
mongoose.connection.useDb('instructor')

let CustomerSchema = new mongoose.Schema({
    fullnametext: String,
    regioncode: String,
    phonetext: {
        type: String,
        unique: true
    },
    useremail: {
        type: String,
        unique: true
    },
    usertypeselection: String,
    typeofinstructorselect: String,
    degreeselection: {
        type: String,
        required: false
    },
    institutionnametext: {
        type: String,
        required: false
    },
    institutiontypeselection: {
        type: String,
        required: false
    },
    roleselection: {
        type: String,
        required: false
    },
    usernametext: {
        type: String,
        unique: true
    },
    userpassword: String

})


module.exports = mongoose.model('instructor', CustomerSchema)
