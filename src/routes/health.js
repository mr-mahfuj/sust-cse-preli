'use strict';

const express = require('express');

const router = express.Router();

function getHealth(req, res) {
    res.status(200).json({ status: 'ok' });
}

router.get('/health', getHealth);

module.exports = router;