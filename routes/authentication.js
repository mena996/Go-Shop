const router = require("express").Router();
const UserModel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticated = require("../middlewares/authorization").shouldBe('user');

// Main login logic
const login = async (req, res) => {
  // extracting the email and password fields from the body
  const {
    body: { username, password, isAdmin },
  } = req;
  try {
    // Check if user exists with this username
    const user = await UserModel.findOne({ username: escape(username.toLowerCase()) });
    // if no user is found for this username send 401 error
    if (!user) return res.sendStatus(401).send("Invalid credentials");
    // else, compare the password hash with the hashed password in the database
    if (await bcrypt.compare(password, user.password)) {
      // Generate the access token
      const accessToken = generateAccessToken(user);
      // Split the JWT token into two parts:
      // first part is the header and payload part and the other part is the signature and it's httpOnly
      // to prevent modifying it and both parts are signed with a key
      // both will be set to be secured: true in production and deployment
      const accessTokenP1 = accessToken.split(".").slice(0, 2).join(".");
      const accessTokenP2 = accessToken.split(".")[2];
      res.cookie("accessTokenP1", accessTokenP1, {
        secure: false,
        sameSite: true,
        signed: true,
        expires: new Date(Date.now() + 31536000000),
      });
      res.cookie("accessTokenP2", accessTokenP2, {
        secure: false,
        httpOnly: true,
        sameSite: true,
        signed: true,
        expires: new Date(Date.now() + 31536000000),
      });
      // sending userData
      const {password, __v, email, fullName, ...userData} = user._doc
      res.cookie("userData", JSON.stringify(userData), {
        secure: false,
        sameSite: true,
        expires: new Date(Date.now() + 31536000000),
      });
      // Send success response
      (isAdmin && user.isadmin) ? res.sendStatus(201) : res.sendStatus(200);
    } else {
      // if the password hash is not matched return error response
      res.status(401).send("Invalid credentials");
    }
  } catch {
    // if any error happend return server-side problem code
    res.status(500).send("Internal server error");
  }
};

const generateAccessToken = (userData) => {
  // Removing sensitive user data before generating the token
  const { password,__v,email,username,phone,favorites,wishlist, ...user } = userData._doc;
  // Generating the token with 1 day expiry
  return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const logout = async (req, res) => {
  // When user log out clear both cookies and send success code
  res.clearCookie("accessTokenP1");
  res.clearCookie("accessTokenP2");
  res.clearCookie("userData");
  res.sendStatus(200);
};

// Router routes for login, logout, and check authentication
router.post("/login", login);
router.post("/logout", logout);
router.post("/checkAuth", authenticated, async (req, res, next) => {
  // if user passes the authentication middleware send a success code
  // else send unauthorized code
  req.user ? res.sendStatus(200) : res.sendStatus(443);
});

module.exports = router;
