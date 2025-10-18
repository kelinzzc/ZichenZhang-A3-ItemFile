const express = require('express');
const EventController = require('../controllers/eventController');
const { validateEvent, validatePagination } = require('../middleware/validation');

const router = express.Router();


router.get('/', validatePagination, EventController.getAllEvents);


router.get('/search', validatePagination, EventController.searchEvents);


router.get('/stats', EventController.getEventStats);


router.get('/:id', EventController.getEventById);


router.post('/', validateEvent, EventController.createEvent);


router.put('/:id', validateEvent, EventController.updateEvent);


router.delete('/:id', EventController.deleteEvent);

module.exports = router;