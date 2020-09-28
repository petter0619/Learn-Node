const express = require('express');
const router = express.Router();

// Import route handlers
const storeController = require('../controllers/storeController');
// Import error handler
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', storeController.homePage);
router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));

module.exports = router;
