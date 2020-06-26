const jwt = require("jsonwebtoken");

const shouldBe = (role) => {
  return (req, res, next) => {
    // if the user have a signed cookie holding the access token
    if (req.signedCookies.accessTokenP1) {
      // Re-assemble the splitted access token
      let token =
        req.signedCookies.accessTokenP1 + "." + req.signedCookies.accessTokenP2;
      // Calling the verification method to check its validity
      verifyToken(token, role, req, res, next);
    } else {
      // no token was provided
      res.sendStatus(401);
    }
  };
};

const verifyToken = (token, role, req, res, next) => {
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userData) => {
    // token expired or not valid
    if (err) res.sendStatus(402);
    if (role === "admin") {
      userData.user.isadmin
        ? next()
        : res.status(403).json({ error: "Not Authorized" });
    } else {
      req.user = userData.user;
      next();
    }
  });
};


module.exports = {
  shouldBe,
};
