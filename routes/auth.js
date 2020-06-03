const UserModel = require('../models/users');
const RefreshTokens = require('../models/refreshTokens');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const logIn = async (req, res) => {
    const { body: { username, password, isAdmin} } = req;
    const user = await UserModel.findOne({username});
    if (!user) return res.sendStatus(404);
    try {
        if (await bcrypt.compare(password,user.password)){
            const {password,__v,...userData} = user._doc
            const accessToken = generateAccessToken(userData);
            const refreshToken = generateRefreshToken(userData);
            await RefreshTokens.create({ token: refreshToken });
            (isAdmin && user.isadmin) ? res.status(201).json({accessToken, refreshToken}) : res.status(200).json({accessToken, refreshToken});
        }else{
            res.sendStatus(401);
        }
    } catch (e){
        console.log(e)
        res.sendStatus(500);
    }
}

const generateAccessToken = (user) => {
    return jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m'});
}

const generateRefreshToken = (user) => {
    return jwt.sign({user}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30m'});
}

const regenerateAccessToken = async (req, res) => {
    const { body: { refreshToken } } = req;
    if (!refreshToken) return res.status(401).send()
    const token = await RefreshTokens.findOne({token: refreshToken});
    if (!token) return res.status(403).send();
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send()
        const accessToken = generateAccessToken(user)
        res.json({ accessToken })
    })
}

const authenticateToken = (req,res,next) => {
    const {body:{token}} = req
    if (!token) return res.status(401).send();
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send();
        req.user = user;
        res.json(user)
    })
}

const shouldBe = (role) => {
    return (req, res, next) => {
        if (typeof req.headers.authorization !== "undefined") {
            let token = req.headers.authorization.split(" ")[1];
            jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, userData) => {
                if (err) {  
                res.status(443).json({ error: "Not Authorized" });
                throw new Error("Not Authorized");
                }
                if (role === 'admin') userData.user.isadmin ? next() : res.status(403).json({ error: "Not Authorized" });
                else next();
            });
        } else {
            res.status(443).json({ error: "Not Authorized" });
            throw new Error("Not Authorized");
        }
    }
}

const logOut = async (req, res) => {
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
    logIn,
    authenticateToken,
    regenerateAccessToken,
    shouldBe,
    logOut,
}