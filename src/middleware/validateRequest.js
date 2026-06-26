'use strict';

const requestSchema = require('../models/requestSchema');

function validateRequest(req, res, next) {
    const { error } = requestSchema.validate(req.body, {
      abortEarly: false,
      convert: true
    });

    if (!error) {
      return next();
    }

    const details = error.details.map((d) => d.message);

    return res.status(400).json({
      error: 'Validation error',
      details
    });
}

module.exports = validateRequest;