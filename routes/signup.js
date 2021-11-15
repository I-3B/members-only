const express = require("express");
const router = express.Router();
const { check, body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
router.get("/", (req, res) => {
    res.render("signup", {
        user: false,
        title: "Sign Up:",
        username: "",
        errors: [],
    });
});
router.post("/", [
    body("username")
        .exists()
        .trim()
        .matches("^[a-zA-Z0-9_]+$")
        .withMessage(
            "username can only contain A-Z, a-z, 0-9 and underscore( _ )"
        )
        .isLength({ min: 3, max: 16 })
        .withMessage(
            "username cannot be less than 3 characters and more than 16."
        )
        .escape(),
    body("password")
        .exists()
        .trim()
        .isLength({ min: 8, max: 16 })
        .withMessage(
            "password cannot be less than 8 or more then 16 characters."
        )
        .escape(),
    check(
        "password-confirm",
        "password and confirm password doesn't match."
    ).custom(
        (passwordConfirm, { req }) => passwordConfirm === req.body.password
    ),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("signup", {
                user: false,
                title: "Sign Up:",
                username: req.body.username,
                errors: errors.array(),
            });
        } else {
            User.findOne({ username: req.body.username }).exec(
                (err, userFound) => {
                    if (err) next(err);
                    if (userFound) {
                        res.render("signup", {
                            user: false,
                            title: "Sign Up:",
                            username: req.body.username,
                            errors: [{ msg: "username is already used" }],
                        });
                    } else {
                        bcrypt.hash(
                            req.body.password,
                            10,
                            (err, hashedPassword) => {
                                if (err) next(err);
                                new User({
                                    username: req.body.username,
                                    password: hashedPassword,
                                }).save((err) => {
                                    if (err) next(err);
                                    res.redirect("/");
                                });
                            }
                        );
                    }
                }
            );
        }
    },
]);
module.exports = router;
