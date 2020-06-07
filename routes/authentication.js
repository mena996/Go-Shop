const UserModel = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { body: { username, password, isAdmin } } = req;
    try {
        const user = await UserModel.findOne({ username });
        if (!user) return res.sendStatus(404);
        if (await bcrypt.compare(password,user.password)) {
            const {password,__v,...userData} = user._doc
            const accessToken = generateAccessToken(userData);
            if (isAdmin && user.isadmin) {
                res.status(201).json({ accessToken });
            }else{
                res.status(200).json({ accessToken });
            }
        } else {
            res.sendStatus(401);
        }
    } catch {
        res.sendStatus(500);
    }
}

const generateAccessToken = (user) => {
    return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
}

const getUser = (req,res,next) => {
    const { body: { token } } = req
    if (!token) return res.status(401).send();
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send();
        req.user = user;
        res.json(user)
    })
}

module.exports = {
    login,
    getUser,
}