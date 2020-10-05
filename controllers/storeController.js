const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto) {
            next(null, true);
        } else {
            next({message: 'That filetype isn\'t allowed!'}, false);
        }
    }
}


exports.homePage = (req, res) => {
    res.render('index');
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'});
}

// Image upload middleware
exports.upload = multer(multerOptions).single('photo');
exports.resize = async (req, res, next) => {
    // Check if there is a new file to resize
    if(!req.file) {
        next();
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    // Now resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`); // Save photo to disc
    // Once we have written our photo to our file system keep going
    next();
}

exports.createStore = async (req, res) => {
    req.body.author = req.user._id;
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

const confirmOwner = (store, user) => {
    if(!store.author.equals(user._id)) {
        throw Error('You must own a store in order to edit it!');
    }
}

exports.editStore = async (req, res) => {
    // 1) Find the store with the given ID
    const store = await Store.findOne({ _id: req.params.id} );
    // 2) Confirm they are the owner of the store
    confirmOwner(store, req.user);
    // 3) Render out the edit form so the user can update their store
    res.render('editStore', { title: `Edit ${store.name}`, store });
}

exports.updateStore = async (req, res) => {
    // 0) Set location data to be a point
    req.body.location.type = 'Point';
    // 1) Find and update the store
    const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true, // Return the new stores instead of the old one
        runValidators: true, // Needed so database checks for 'required' fields determined in model
        useFindAndModify: false
    }).exec();
    // 2) Redirect them to store and tell them it worked
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View store -></a>`);
    res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res) => {
    const store = await (await Store.findOne({ slug: req.params.slug })).populate('author');
    if(!store) return next();
    res.render('store', { store, title: store.name });
}

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };
    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find( { tags: tagQuery } );
    const result = await Promise.all([tagsPromise, storesPromise]);
    
    const tags = result[0];
    const stores = result[1];

    res.render('tags', { tags: tags, title: 'Tags', tag, stores });
}

exports.searchStores = async (req, res) => {
    const stores = await Store.find({
        $text: {
            $search: req.query.q
        }
    }, {
        score: { $meta: 'textScore' }
    }).sort({
        score: { $meta: 'textScore' }
    }).limit(5);
    res.json(stores);
}