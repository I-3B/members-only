const createError = require("http-errors");
const express = require("express");
const passport = require("passport");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const adminPrivileges = ["member's privileges", "can delete any message"];
const memberPrivileges = [
    "can view all messages",
    "can view message's sender",
    "can view message's date",
    "can delete their messages",
];

router.get("/", function (req, res, next) {
    Message.find()
        .limit(15)
        .sort({ timestamp: -1 })
        .exec((err, messages) => {
            if (err) next(err);
            res.render("index", {
                title: "",
                user: req.user,
                messages: messages,
                all: false,
            });
        });
});

router.get("/all", function (req, res, next) {
    if (req.user) {
        if (req.user.member) {
            Message.find()
                .sort({ timestamp: -1 })
                .exec((err, messages) => {
                    if (err) next(err);
                    res.render("index", {
                        title: "All:",
                        user: req.user,
                        messages: messages,
                        all: true,
                    });
                });
        } else {
            res.redirect("/member");
        }
    } else res.redirect("/login");
});

router.get("/login", (req, res, next) => {
    res.render("login", {
        title: "Log In:",
        user: req.user,
        username: req.body.username,
        error: req.flash("error"),
    });
});
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
);
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});
router.post("/new", (req, res, next) => {
    if (req.user) {
        new Message({
            sender: req.user.username,
            content: req.body.message,
            timestamp: Date.now(),
        }).save((err) => {
            if (err) next(err);
            res.redirect("/");
        });
    } else next(createError(403));
});
router.get("/member", (req, res) => {
    if (req.user) {
        res.render("passcode", {
            user: false,
            title: "Become a member",
            passcodeType: "member",
            privileges: memberPrivileges,
            error: "",
        });
    } else res.redirect("/login");
});
router.post("/member", (req, res, next) => {
    if (req.user) {
        if (req.body.passcode === process.env.MEMBER_PASSCODE) {
            User.findByIdAndUpdate(req.user._id, { member: true }, (err) => {
                if (err) next(err);
                res.redirect("/");
            });
        } else {
            res.render("passcode", {
                user: false,
                title: "Become a member",
                passcodeType: "member",
                privileges: memberPrivileges,
                error: "Wrong passcode",
            });
        }
    } else next(createError(403));
});
router.get("/admin", (req, res) => {
    if (req.user) {
        res.render("passcode", {
            user: false,
            title: "Become an admin",
            passcodeType: "admin",
            privileges: adminPrivileges,
            error: "",
        });
    } else res.redirect("/login");
});
router.post("/admin", (req, res, next) => {
    if (req.user) {
        if (req.body.passcode === process.env.ADMIN_PASSCODE) {
            User.findByIdAndUpdate(
                req.user._id,
                { member: true, admin: true },
                (err) => {
                    if (err) next(err);
                    res.redirect("/");
                }
            );
        } else {
            res.render("passcode", {
                user: false,
                title: "Become an Admin",
                passcodeType: "admin",
                privileges: adminPrivileges,
                error: "Wrong passcode, in your dreams lol.",
            });
        }
    } else next(createError(403));
});
router.get("/:id/delete", (req, res, next) => {
    if (req.user) {
        if (req.user.admin) {
            Message.findByIdAndRemove(req.params.id, (err) => {
                if (err) next(err);
                res.redirect("/");
            });
        } else if (req.user.member) {
            Message.findById(req.params.id, (err, message) => {
                if (err) next(err);
                if (req.user.username === message.sender) {
                    Message.findByIdAndRemove(req.params.id, (err) => {
                        if (err) next(err);
                        res.redirect("/");
                    });
                } else next(createError(403));
            });
        } else next(createError(403));
    } else next(createError(403));
});
module.exports = router;
