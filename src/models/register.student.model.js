let mongoose = require('mongoose');

mongoose.connect("mongodb+srv://jackiebibili:ejXz0PINCGNwZ3Ng@cluster0.1jl6d.mongodb.net/student?retryWrites=true&w=majority", {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true
});

let CustomerSchema = new mongoose.Schema({
    fullname: String,
    phone_country_code: {
        type: String,
        unique: true
    },
    phone_number: String,
    email: {
        type: String,
        unique: true
    },
    register_as: String,
    grade_level: String,
    year_of_birth: String,
    username: {
        type: String,
        unique: true
    },
    password: String
})


module.exports = mongoose.model('Student', CustomerSchema)
