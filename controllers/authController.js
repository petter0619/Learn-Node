const passport = require('passport');


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