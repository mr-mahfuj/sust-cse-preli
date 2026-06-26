'use strict';

const investigate = require('../core/investigator');

async function analyzeTicketController(req, res, next) {
    try {
        const result = await investigate(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return next(err);
    }
}

module.exports = analyzeTicketController;