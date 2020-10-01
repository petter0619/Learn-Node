const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');


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
    req.flash('success', `You have been emailed a password reset link. ${resetURL}`);
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