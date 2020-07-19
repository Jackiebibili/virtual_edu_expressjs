let express = require('express')
let router = express.Router()
let path = require('path')

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/sign_up_console.html'))
})

module.exports = router