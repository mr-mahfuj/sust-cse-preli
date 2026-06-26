'use strict';

function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Not found' });
}

/**
 * Central error handler.
 *
 * - For client errors (HTTP 4xx) propagated by upstream middleware
 *   (e.g. express.json body-parser sets `err.status = 400` on invalid JSON),
 *   we honor that status code so callers see the right semantic.
 * - For body-parser errors specifically, expose a safe message.
 * - For everything else, return 500 with a generic body and never leak
 *   stack traces or internal details.
 */
function errorHandler(err, req, res, next) {
  const rawStatus = err && (err.status || err.statusCode);
  const status =
    Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus < 500
      ? rawStatus
      : 500;

  if (status === 400) {
    return res.status(400).json({ error: 'Bad request' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFoundHandler, errorHandler };