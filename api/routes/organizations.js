const express = require('express');
const OrganizationController = require('../controllers/organizationController');

const router = express.Router();

// 获取所有组织
router.get('/', OrganizationController.getAllOrganizations);

module.exports = router;