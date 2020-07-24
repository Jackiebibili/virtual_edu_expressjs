mongoose.connection.collection('Students')

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

    gradelevelselect: {
        type: String,
        required: true
    },
    yearofbirthselect: {
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
    },
    creationDate: {
        type: String,
        default: Date.now
    },
    lastLoginDate: {
        type: String,
        default: ""
    },
    currentLoginDate: {
        type: String,
        default: ""
    }


})


module.exports = mongoose.model('Students', CustomerSchema)
