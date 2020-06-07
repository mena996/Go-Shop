const jwt = require('jsonwebtoken');

const shouldBe = (role) => {
    return (req, res, next) => {
        if (typeof req.headers.authorization !== "undefined") {
            let token = req.headers.authorization.split(" ")[1];
            verifyToken = (token, role, res, next);
        } else {
            notAuthorizedResponse(res);
        }
    }
}

const verifyToken = (token, role, res, next) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userData) => {
        if (err) notAuthorizedResponse(res);
        if (role === 'admin') {
            userData.user.isadmin ? next() : res.status(403).json({ error: "Not Authorized" });
        }else next();
    });
}

const notAuthorizedResponse = (res) => {
    res.status(443).json({ error: "Not Authorized" });
    throw new Error("Not Authorized");
}

module.exports = {
    shouldBe
}