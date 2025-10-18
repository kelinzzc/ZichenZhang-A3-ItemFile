const express = require('express');
const OrganizationController = require('../controllers/organizationController');

const router = express.Router();


router.get('/', OrganizationController.getAllOrganizations);

module.exports = router;