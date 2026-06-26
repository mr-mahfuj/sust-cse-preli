'use strict';

function notFoundHandler(req, res, next) {
  	res.status(404).json({ error: 'Not found' });
}

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