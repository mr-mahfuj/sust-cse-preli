'use strict';

const express = require('express');

const validateRequest = require('../middleware/validateRequest');
const analyzeTicketController = require('../controllers/analyzeTicketController');

const router = express.Router();

router.post('/analyze-ticket', validateRequest, analyzeTicketController);

module.exports = router;