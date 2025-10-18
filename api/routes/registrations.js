const express = require('express');
const RegistrationController = require('../controllers/registrationController');
const { validateRegistration, validatePagination } = require('../middleware/validation');

const router = express.Router();


router.get('/', validatePagination, RegistrationController.getAllRegistrations);


router.get('/stats', RegistrationController.getRegistrationStats);


router.get('/event/:eventId', RegistrationController.getRegistrationsByEventId);


router.post('/', validateRegistration, RegistrationController.createRegistration);


router.delete('/:id', RegistrationController.deleteRegistration);

module.exports = router;