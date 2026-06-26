'use strict';

const request = require('supertest');

const app = require('../index');

describe('Health endpoint', () => {
	test('GET /health returns 200 with { status: "ok" }', async () => {
		const res = await request(app).get('/health');
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ status: 'ok' });
	});

	test('GET /health returns Content-Type application/json', async () => {
		const res = await request(app).get('/health');
		expect(res.headers['content-type']).toMatch(/application\/json/);
	});

	test('GET /unknown returns 404 with an error field', async () => {
		const res = await request(app).get('/unknown');
		expect(res.status).toBe(404);
		expect(res.body).toHaveProperty('error');
	});

	test('GET / returns 404', async () => {
		const res = await request(app).get('/');
		expect(res.status).toBe(404);
	});

	test('no response body contains a "stack" field', async () => {
		const responses = await Promise.all([
			request(app).get('/health'),
			request(app).get('/unknown'),
			request(app).get('/'),
		]);
		for (const res of responses) {
			expect(res.body).not.toHaveProperty('stack');
			const serialized = JSON.stringify(res.body);
			expect(serialized).not.toMatch(/stack/i);
		}
	});
});