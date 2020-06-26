const express = require('express');
let UserModel = require('../models/users');
let FavoriteModel = require('../models/favorite');
const middleware = require('../middlewares/authorization');
const router = express.Router();
const sendVarifyMail = require('./mailer');
    router.post('/', (req, res) => {
        const { body: { firstName, lastName, username, email, password, phone, address } } = req;
        const user = new UserModel({
            firstName, lastName, username: escape(username.toLowerCase()), email, password, isadmin: 0, phone, address,
        })
        user.save((err) => {
            if (err) {
                console.log(err);
                return res.status(400).send(err);
            }
            sendVarifyMail.sendVarifyMail(email,user._id);
            res.json("done");
        });
    });

    router.get('/', middleware.shouldBe('admin'), async (req, res) => {
        try {
            const users = await UserModel.find({}).select("-password");
            res.json(users);
        } catch (err) {
            return res.status(500).send("Internal server error: Can't get users");
        }
    });

    router.get('/favorite', middleware.shouldBe('user'), async (req, res, next) => {
        try {
            const favorite = await FavoriteModel.find({ user: req.user._id }).populate(
                {
                    path: 'product',
                    populate: { path: 'category' }
                });

            console.log(favorite);

            res.json(favorite);
        } catch {
            next("Internal server error: Can't get favorite details");
        }
    });

    router.post('/cart', middleware.shouldBe('user'), async (req, res, next) => {
        try {
            await UserModel.updateOne({ _id: req.user._id }, { $push: { cart: req.body } });
            res.sendStatus(200);
        } catch {
            next("Internal server error: Can't update your cart");
        }
    });

    router.patch('/cart', middleware.shouldBe('user'), async (req, res, next) => {
        try {
            console.log(req.body)
            await UserModel.updateOne({ _id: req.user._id }, { $set: { 'cart': req.body } }, { new: true })
            const cart = await UserModel.findOne({ _id: req.user._id }).populate('cart.product').select('cart');
            console.log(cart)
            res.json(cart);
        } catch (e) {
            console.log(e)
            next("Internal server error: Can't update your cart");
        }
    });

    router.get('/cart', middleware.shouldBe('user'), async (req, res, next) => {
        try {
            const cart = await UserModel.findOne({ _id: req.user._id }).populate('cart.product').select('cart');
            res.json(cart);
        } catch {
            next("Internal server error: Can't get cart details");
        }
    });

    router.post('/wishlist', middleware.shouldBe('user'), async (req, res, next) => {
        try {
            await UserModel.updateOne({ _id: req.user._id }, { $push: { wishlist: req.body } });
            res.sendStatus(200);
        } catch {
            next("Internal server error: Can't update your wishlist");
        }
    });

    router.patch('/wishlist', middleware.shouldBe('user'), async (req, res, next) => {
        try {
            console.log(req.body)
            await UserModel.updateOne({ _id: req.user._id }, { $set: { 'wishlist': req.body } }, { new: true })
            const wishlist = await UserModel.findOne({ _id: req.user._id }).populate('wishlist.product').select('wishlist');
            console.log(wishlist)
            res.json(wishlist);
        } catch (e) {
            console.log(e)
            next("Internal server error: Can't update your wishlist");
        }
    });

    router.get('/wishlist/:id', async (req, res, next) => {
        try {
            const wishlist = await UserModel.findById(req.params.id).populate('wishlist.product').select('wishlist');
            res.json(wishlist);
        } catch {
            next("Internal server error: Can't get wishlist details");
        }
    });
    router.get('/wishlist', middleware.shouldBe('user'), async (req, res, next) => {
        try {
            const wishlist = await UserModel.findOne({ _id: req.user._id }).populate('wishlist.product').select('wishlist');
            res.json(wishlist);
        } catch {
            next("Internal server error: Can't get wishlist details");
        }
    });

    router.patch('/:id', middleware.shouldBe('admin'), async (req, res, next) => {
        try {
            const user = await UserModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
            if (!user) res.status(404).send("user not found");
            else res.json(user);
        } catch {
            next("Internal server error: Can't update user details");
        }
    });


    router.use((err, req, res, next) => {
        res.send("oh no there is some thing wrong happend :( \n" + err);
    });

    module.exports = router;