const mongoose = require('mongoose');
const Store = mongoose.model('Store');


exports.homePage = (req, res) => {
    res.render('index');
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'});
}

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save();
    console.log('Store created!');
    req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
    // 1) Query database for a list of all stores
    const stores = await Store.find();

    res.render('stores', { title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
    // 1) Find the store with the given ID
    const store = await Store.findOne({ _id: req.params.id} );
    // 2) Confirm they are the owner of the store

    // 3) Render out the edit form so the user can update their store
    res.render('editStore', { title: `Edit ${store.name}`, store });
}

exports.updateStore = async (req, res) => {
    // 0) Set location data to be a point
    req.body.location.type = 'Point';
    // 1) Find and update the store
    const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true, // Return the new stores instead of the old one
        runValidators: true // Needed so database checks for 'required' fields determined in model
    }).exec();
    // 2) Redirect them to store and tell them it worked
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View store -></a>`);
    res.redirect(`/stores/${store._id}/edit`);
}