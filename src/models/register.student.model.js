//let mongoose = require('mongoose');
mongoose.connection.collection('Students')

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
    gradelevelselect: String,
    yearofbirthselect: String,
    usernametext: {
        type: String,
        unique: true
    },
    userpassword: String
})


module.exports = mongoose.model('Students', CustomerSchema)
