const express = require('express');
let UserModel = require('../models/users');
const bcrypt = require('bcrypt');
const auth = require('./auth')
const router = express.Router();

// router.get('/', (req, res) => {
//     return UserModel.find({}).populate('posts', ['title', 'body']).exec((err, users) => {
//         if (err) return res.send(err);
//         res.json(users);
//     });
// });
// router.get('/:id', (req, res) => {
//     return UserModel.findById(req.params.id, (err, users) => {
//         if (err) return res.send(err);
//         res.json(users);
//     });
// });
// router.get('/:id/posts', (req, res) => {
//     return PostModel.find({ auther_id: req.params.id }, (err, users) => {
//         if (err) return res.send(err);
//         res.json(users);
//     });
// });
// router.post('/', (req, res) => {
//     const { body: { firstName, lastName, email, password } } = req;
//     const user = new UserModel({
//         firstName, lastName, email, password
//     })
//     console.log(user);
//     user.save((err) => {
//         if (err)
//             return res.send(err);
//         res.json(user);
//     });
// });
// router.patch('/:id', (req, res) => {
//     let { body: { firstName, lastName, email, password } } = req;
//     if (password) password = bcrypt.hashSync(password, 10);

//     let user = {
//         firstName, lastName, email, password
//     }
//     Object.keys(user).forEach(key => user[key] === undefined && delete user[key]);
//     console.log(user);
//     UserModel.updateOne({ _id: req.params.id }, user, (err) => {
//         if (err)
//             return res.send(err);
//         res.json(user);
//     });
// });
// router.delete('/:id', (req, res) => {
//     return UserModel.findByIdAndDelete(req.params.id, (err, users) => {
//         if (err) return res.send(err);
//         res.json(users);
//     });
// });


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