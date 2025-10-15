const express = require('express');
const CategoryController = require('../controllers/categoryController');

const router = express.Router();

// 获取所有类别
router.get('/', CategoryController.getAllCategories);

// 获取单个类别详情
router.get('/:id', CategoryController.getCategoryById);

module.exports = router;