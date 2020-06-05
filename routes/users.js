const express = require('express');
let UserModel = require('../models/users');
const bcrypt = require('bcrypt');
const auth = require('./auth')
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

router.post('/login', auth.logIn);
router.post('/token', auth.regenerateAccessToken);
router.post('/check', auth.authenticateToken);
router.delete('/logout', auth.logOut);




router.use((err, req, res, next) => {
    res.send("oh no there is some thing wrong happend :( \n" + err);
});

module.exports = router;