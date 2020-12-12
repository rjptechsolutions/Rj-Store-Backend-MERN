const User = require("../models/user");
const {
    check,
    validationResult
} = require('express-validator');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');


exports.signup = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg,
            Parameter: errors.array()[0].param
        })
    }
    const user = new User(req.body)
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: "Not able to Save User"
            })
        }
        res.json({
            name: user.first_name,
            eamil: user.email,
            id: user._id
        });
    })
}

exports.signin = (req, res) => {
    const errors = validationResult(req)
    const {
        email,
        password
    } = req.body;
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg,
            Parameter: errors.array()[0].param
        })
    }
    User.findOne({
        email
    }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User email does not exits"
            })
        }
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and Password does not match"
            })
        }

        //create token
        const token = jwt.sign({
            _id: user._id
        }, process.env.SECRET)

        //put token in cookie
        res.cookie("token", token, {
            expire: new Date() + 9999
        });

        //send response to front end
        const {
            _id,
            first_name,
            email,
            role
        } = user;
        return res.json({
            token,
            user: {
                _id,
                first_name,
                email,
                role
            }
        });
    })
};

exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "User Logout successfully"
    })
};

//protected routes
exports.isSignedIn = exjwt({
    secret: process.env.SECRET,
    userProperty: "auth"
})

//custome middlewear
exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!checker) {
        return res.status(403).json({
            error: "ACCESS DENIED"
        })
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "Invalid link, Access denied"
        })
    }
    next();
}