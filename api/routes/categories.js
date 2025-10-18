const express = require('express');
const CategoryController = require('../controllers/categoryController');

const router = express.Router();

router.get('/', CategoryController.getAllCategories);


router.get('/:id', CategoryController.getCategoryById);

module.exports = router;