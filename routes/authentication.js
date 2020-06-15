const UserModel = require('../models/users');
const RefreshTokens = require('../models/refreshTokens');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { body: { username, password, isAdmin } } = req;
    try {
        const user = await UserModel.findOne({ username });
        if (!user) return res.sendStatus(404);
        if (await bcrypt.compare(password, user.password)){
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user._id);
            const expAt = Math.ceil(Date.now() / 1000) + 20;
            await RefreshTokens.findOneAndUpdate({ user}, {token: refreshToken }, {upsert: true, new: true, setDefaultsOnInsert: true});
            (isAdmin && user.isadmin) ? res.status(201).json({accessToken, refreshToken, expAt}) : res.status(200).json({accessToken, refreshToken, expAt});
        } else {
            res.sendStatus(401);
        }
    } catch {
        res.sendStatus(500);
    }
}

const generateAccessToken = (userData) => {
    const {password,__v,favorites,wishlist,...user} = userData._doc 
    return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' });
}

const generateRefreshToken = (user) => {
    return jwt.sign({user}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d'});
}

const regenerateAccessToken = async (req, res) => {
    const { body: { refreshToken } } = req;
    if (!refreshToken) return res.status(402).send();
    const token = await RefreshTokens.findOne({token: refreshToken});
    if (!token) return res.status(403).send();
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).send();
        UserModel.findOne({ _id: user.user }).then((user) => {
            const accessToken = generateAccessToken(user);
            const expAt = Math.ceil(Date.now() / 1000) + 20;
            res.json({ accessToken, expAt })

        });
    })
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

const logout = async (req, res) => {
    const {body:{refreshToken}} = req
    try{
        const token = await RefreshTokens.findOneAndDelete({token: refreshToken});
        if (!token) return res.status(402).send("Token not found");
        res.sendStatus(204)
    }catch{
        res.sendStatus(500)
    }
}

module.exports = {
    login,
    getUser,
    regenerateAccessToken,
    logout
}