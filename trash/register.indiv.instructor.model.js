mongoose.connection.collection('Individual-Instructors')

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
        required: true
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


module.exports = mongoose.model('Individual-Instructors', CustomerSchema)
