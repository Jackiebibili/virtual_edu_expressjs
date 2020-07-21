mongoose.connection.collection('Instructors')

let CustomerSchema = new mongoose.Schema({
    fullnametext: {
        type: String,
        required: true
    },
    regioncode: {
        type: String,
        required: true
    },
    phonetext: {
        type: String,
        unique: true,
        required: true
    },
    useremail: {
        type: String,
        unique: true,
        required: true
    },
    usertypeselection: {
        type: String,
        required: true
    },
    typeofinstructorselect: {
        type: String,
        required: true
    },
    degreeselection: {
        type: String,
        required: false,
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
        unique: true,
        required: true
    },
    userpassword: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('Instructors', CustomerSchema)
