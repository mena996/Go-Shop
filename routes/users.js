const express = require('express');
let UserModel = require('../models/users');
const bcrypt = require('bcrypt');
const auth = require('./authentication')
const middleware = require('../middlewares/authorization');
const router = express.Router();
const multer = require('../middlewares/multer');
router.post('/', /*multer.upload.single('image'),*/ (req, res) => {
    const url = req.protocol + '://' + req.get('host');
    console.log(req.body);
    const { body: { firstName, lastName, username, email, password, phone, address } } = req;
    const user = new UserModel({
        firstName, lastName, username, email, password, isadmin: 0, phone, address,
        // image: url + '/public/images/' + req.file.filename,
    })
    user.save((err) => {
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        res.json("done");
    });
});

router.get('/', middleware.shouldBe('admin'), async(req, res) => {
    try {
        const users = await UserModel.find({}).select("-password");
        res.json(users);
    } catch (err) {
        return res.status(500).send("Internal server error: Can't get users");
    }
} )

router.post('/cart', middleware.shouldBe('user'), async(req, res, next) => {
    try {
        await UserModel.updateOne({_id: req.user._id}, {$push: {cart: req.body}});
        res.sendStatus(200);
    } catch {
        next("Internal server error: Can't update your cart");
    }
});

router.patch('/cart', middleware.shouldBe('user'), async(req, res, next) => {
    try {
        console.log(req.body)
        await UserModel.updateOne({_id: req.user._id }, {$set: {'cart': req.body}}, { new: true})
        const cart = await UserModel.findOne({_id: req.user._id}).populate('cart.product').select('cart');
        console.log(cart)
        res.json(cart);
    } catch (e){
        console.log(e)
        next("Internal server error: Can't update your cart");
    }
});

router.get('/cart', middleware.shouldBe('user'), async(req, res, next) => {
    try {
        const cart = await UserModel.findOne({_id: req.user._id}).populate('cart.product').select('cart');
        res.json(cart);
    } catch {
        next("Internal server error: Can't get cart details");
    }
});

router.patch('/:id', middleware.shouldBe('admin'), async(req, res, next) => {
    try {
        const user = await UserModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
        if (!user) res.status(404).send("user not found");
        else res.json(user);
    } catch {
        next("Internal server error: Can't update user details");
    }
});


router.post('/login', auth.login);
router.post('/me', auth.getUser);
router.post('/refresh', auth.regenerateAccessToken);
router.post('/logout', auth.logout);

router.use((err, req, res, next) => {
    res.send("oh no there is some thing wrong happend :( \n" + err);
});

module.exports = router;