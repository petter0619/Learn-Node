const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');


exports.login = passport.authenticate('local', {
    failureFlash: 'Failed login!',
    failureRedirect: '/login',
    successFlash: 'You are now logged in!',
    successRedirect: '/',
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out!');
    res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
    // Check if user is authenticated
    if(req.isAuthenticated()) {
        next();
        return;
    } else {
        req.flash('error', 'Ooops! You must be logged in to do that!');
        res.redirect('/login');
    }
}

exports.forgot = async (req, res) => {
    // 1. See if that email exists
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        req.flash('error', 'No account with that email exists!');
        return res.redirect('/login');
    }
    // 2. Set reset token and expiry on their account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    // 3. Send them an email with the token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    await mail.send({
        user: user,
        subject: 'Password Reset',
        resetURL: resetURL,
        filename: 'password-reset'
    });
    req.flash('success', `You have been emailed a password reset link.`);
    // 4. Redirect to login page
    res.redirect('/login');
}

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if(!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }
    // If there is a user, show the reset password form
    res.render('reset', { title: 'Reset your Password' });
}

exports.confirmedPasswords = (req, res, next) => {
    if(req.body.password === req.body['password-confirm']) {
        next();
        return;
    }
    req.flash('error', 'Passwords do not match!')
    res.redirect('back');
}

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if(!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }
    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('success', 'Your password has been reset!');
    res.redirect('/');
}