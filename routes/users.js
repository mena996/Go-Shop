const express = require('express');
let UserModel = require('../models/users');
const bcrypt = require('bcrypt');
const auth = require('./authentication')
const router = express.Router();

router.post('/', (req, res) => {
    const { body: { firstName, lastName, username, email, password } } = req;
    const user = new UserModel({
        firstName, lastName, username, email, password, isadmin: 0
    })
    user.save((err) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.json("done");
    });
});

router.post('/login', auth.login);
router.post('/me', auth.getUser);

router.use((err, req, res, next) => {
    res.send("oh no there is some thing wrong happend :( \n" + err);
});

module.exports = router;