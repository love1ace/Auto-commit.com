const express = require('express');
const router = express.Router();
const commitsController = require('../controllers/commitsController');

router.use('/', commitsController);

module.exports = router;