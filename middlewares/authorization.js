const jwt = require('jsonwebtoken');

const shouldBe = (role) => {
    return (req, res, next) => {
        if (typeof req.headers.authorization !== "undefined") {
            let token = req.headers.authorization.split(" ")[1];
            verifyToken(token, role, req, res, next);
        } else {
            // no token was provided
            res.sendStatus(401);
        }
    }
}

const verifyToken = (token, role, req, res, next) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userData) => {
        // token expired or not valid
        if (err) res.sendStatus(402);
        if (role === 'admin') {
            userData.user.isadmin ? next() : res.status(403).json({ error: "Not Authorized" });
        }else{
            req.user = userData.user;
            next();
        } 
    });
}

module.exports = {
    shouldBe
}