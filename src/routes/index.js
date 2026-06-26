'use strict';

const express = require('express');

const healthRouter = require('./health');
const analyzeTicketRouter = require('./analyzeTicket');

const router = express.Router();

router.use(healthRouter);
router.use(analyzeTicketRouter);

module.exports = router;