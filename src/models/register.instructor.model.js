let mongoose = require('mongoose');

mongoose.connect("mongodb+srv://jackiebibili:ejXz0PINCGNwZ3Ng@cluster0.1jl6d.mongodb.net/instructor?retryWrites=true&w=majority", {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true
});

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
