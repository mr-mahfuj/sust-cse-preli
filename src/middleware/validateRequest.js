'use strict';

const requestSchema = require('../models/requestSchema');

/**
 * Express middleware that validates `req.body` against the Joi request schema.
 *
 * On success: calls `next()` without modifying `req.body`.
 * On failure: responds 400 with
 *   { "error": "Validation error", "details": string[] }
 * where each detail is a human-readable Joi message.
 */
function validateRequest(req, res, next) {
  const { error } = requestSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (!error) {
    return next();
  }

  const details = error.details.map((d) => d.message);

  return res.status(400).json({
    error: 'Validation error',
    details,
  });
}

module.exports = validateRequest;