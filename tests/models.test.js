'use strict';

const request = require('supertest');

const requestSchema = require('../src/models/requestSchema');
const responseSchema = require('../src/models/responseSchema');

function detailsAsString(result) {
  	return result.error.details.map((d) => d.message).join(' | ');
}

function buildValidRequest(overrides = {}) {
	return {
		ticket_id: 'TKT-1001',
		complaint: 'Customer says money was sent to the wrong number.',
		language: 'en',
		channel: 'in_app_chat',
		user_type: 'customer',
		campaign_context: 'festive-cashback-2026',
		transaction_history: [
		{
			transaction_id: 'TX-9001',
			timestamp: '2026-06-20T10:15:30.000Z',
			type: 'transfer',
			amount: 1500,
			counterparty: '+8801712345678',
			status: 'completed',
		},
		],
		metadata: { source: 'mobile-app', app_version: '5.4.2' },
		...overrides,
	};
}

function buildValidResponse(overrides = {}) {
	return {
		ticket_id: 'TKT-1001',
		relevant_transaction_id: 'TX-9001',
		evidence_verdict: 'consistent',
		case_type: 'wrong_transfer',
		severity: 'medium',
		department: 'dispute_resolution',
		agent_summary: 'Customer complaint aligns with transaction TX-9001.',
		recommended_next_action: 'Open dispute and freeze counterparty wallet.',
		customer_reply: 'We are reviewing the transfer and will respond within 24 hours.',
		human_review_required: false,
		...overrides,
	};
}

describe('models: requestSchema (Joi)', () => {
	test('valid full request body passes validation', () => {
		const result = requestSchema.validate(buildValidRequest());
		expect(result.error).toBeUndefined();
	});

	test('missing ticket_id returns error mentioning "ticket_id"', () => {
		const body = buildValidRequest();
		delete body.ticket_id;
		const result = requestSchema.validate(body);
		expect(result.error).toBeDefined();
		expect(detailsAsString(result)).toMatch(/ticket_id/);
	});

	test('missing complaint returns error mentioning "complaint"', () => {
		const body = buildValidRequest();
		delete body.complaint;
		const result = requestSchema.validate(body);
		expect(result.error).toBeDefined();
		expect(detailsAsString(result)).toMatch(/complaint/);
	});

	test('empty complaint string fails', () => {
		const body = buildValidRequest({ complaint: '' });
		const result = requestSchema.validate(body);
		expect(result.error).toBeDefined();
		expect(detailsAsString(result)).toMatch(/complaint/);
	});

	test('invalid language enum value fails', () => {
		const body = buildValidRequest({ language: 'klingon' });
		const result = requestSchema.validate(body);
		expect(result.error).toBeDefined();
		expect(detailsAsString(result)).toMatch(/language/);
	});

	test('invalid transaction type enum fails', () => {
		const body = buildValidRequest();
		body.transaction_history[0].type = 'wire_transfer';
		const result = requestSchema.validate(body);
		expect(result.error).toBeDefined();
		expect(detailsAsString(result)).toMatch(/type/);
	});

	test('transaction_history with missing amount fails', () => {
		const body = buildValidRequest();
		delete body.transaction_history[0].amount;
		const result = requestSchema.validate(body);
		expect(result.error).toBeDefined();
		expect(detailsAsString(result)).toMatch(/amount/);
	});
});

describe('models: responseSchema (pure JS)', () => {
	test('valid response object passes validateResponse', () => {
		const result = responseSchema.validateResponse(buildValidResponse());
		expect(result).toEqual({ valid: true });
	});

	test('response missing ticket_id fails validateResponse', () => {
		const response = buildValidResponse();
		delete response.ticket_id;
		const result = responseSchema.validateResponse(response);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => /ticket_id/.test(e))).toBe(true);
	});

	test('response with wrong evidence_verdict value fails validateResponse', () => {
		const response = buildValidResponse({ evidence_verdict: 'maybe' });
		const result = responseSchema.validateResponse(response);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => /evidence_verdict/.test(e))).toBe(true);
	});

	test('response with null relevant_transaction_id passes validateResponse', () => {
		const response = buildValidResponse({ relevant_transaction_id: null });
		const result = responseSchema.validateResponse(response);
		expect(result).toEqual({ valid: true });
	});
});

function buildTestApp() {
	const express = require('express');
	const validateRequest = require('../src/middleware/validateRequest');

	const testApp = express();
	testApp.use(express.json());
	testApp.post('/investigate', validateRequest, (req, res) => {
		res.status(200).json({ ok: true });
	});
	return testApp;
}

describe('middleware: validateRequest (HTTP)', () => {
	const testApp = buildTestApp();

	test('POST with valid body reaches the handler (200)', async () => {
		const res = await request(testApp)
		.post('/investigate')
		.send(buildValidRequest());
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ ok: true });
	});

	test('POST with invalid body returns 400 with Validation error details', async () => {
		const body = buildValidRequest();
		delete body.ticket_id;
		const res = await request(testApp)
		.post('/investigate')
		.send(body);
		expect(res.status).toBe(400);
		expect(res.body).toMatchObject({ error: 'Validation error' });
		expect(Array.isArray(res.body.details)).toBe(true);
		expect(res.body.details.join(' | ')).toMatch(/ticket_id/);
	});

	test('validateRequest middleware does not mutate req.body', async () => {
		const validateRequest = require('../src/middleware/validateRequest');

		const body = buildValidRequest();
		const originalSnapshot = JSON.parse(JSON.stringify(body));

		const req = { body };
		let nextCalled = false;
		const res = {
		statusCode: 0,
		body: null,
		status(code) {
			this.statusCode = code;
			return this;
		},
		json(payload) {
			this.body = payload;
			return this;
		},
		};

		validateRequest(req, res, () => {
		nextCalled = true;
		});

		expect(nextCalled).toBe(true);
		expect(req.body).toEqual(originalSnapshot);
	});
});
