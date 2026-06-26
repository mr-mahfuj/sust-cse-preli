'use strict';

const request = require('supertest');

const app = require('../index');

const {
	EVIDENCE_VERDICT,
	CASE_TYPE,
	DEPARTMENT
} = require('../src/models');

function minimalBody(overrides = {}) {
	return {
		ticket_id: 'TKT-2001',
		complaint: 'Customer says a payment was sent twice.',
		...overrides
	};
}

function fullBody() {
	return {
		ticket_id: 'TKT-2002',
		complaint: 'Customer reports duplicate payment to merchant.',
		language: 'en',
		channel: 'in_app_chat',
		user_type: 'customer',
		campaign_context: 'summer-sale-2026',
		transaction_history: [
		{
			transaction_id: 'TX-7001',
			timestamp: '2026-06-22T08:00:00.000Z',
			type: 'payment',
			amount: 2500,
			counterparty: 'merchant_acme',
			status: 'completed',
		},
		{
			transaction_id: 'TX-7002',
			timestamp: '2026-06-22T08:00:05.000Z',
			type: 'payment',
			amount: 2500,
			counterparty: 'merchant_acme',
			status: 'completed',
		},
		],
		metadata: { source: 'web' }
	};
}

describe('POST /analyze-ticket', () => {
	test('with valid minimal body returns 200', async () => {
		const res = await request(app).post('/analyze-ticket').send(minimalBody());
		expect(res.status).toBe(200);
	});

	test('response body contains all required fields', async () => {
		const res = await request(app).post('/analyze-ticket').send(minimalBody());
		expect(res.status).toBe(200);

		const required = [
		'ticket_id',
		'relevant_transaction_id',
		'evidence_verdict',
		'case_type',
		'severity',
		'department',
		'agent_summary',
		'recommended_next_action',
		'customer_reply',
		'human_review_required'
		];
		for (const field of required) {
			expect(res.body).toHaveProperty(field);
		}
	});

	test('response ticket_id matches request ticket_id', async () => {
		const body = minimalBody({ ticket_id: 'TKT-CORRELATE-99' });
		const res = await request(app).post('/analyze-ticket').send(body);
		expect(res.status).toBe(200);
		expect(res.body.ticket_id).toBe('TKT-CORRELATE-99');
	});

	test('with missing ticket_id returns 400', async () => {
		const body = minimalBody();
		delete body.ticket_id;
		const res = await request(app).post('/analyze-ticket').send(body);
		expect(res.status).toBe(400);
		expect(res.body).toMatchObject({ error: 'Validation error' });
		expect(res.body.details.join(' | ')).toMatch(/ticket_id/);
	});

	test('with missing complaint returns 400', async () => {
		const body = minimalBody();
		delete body.complaint;
		const res = await request(app).post('/analyze-ticket').send(body);
		expect(res.status).toBe(400);
		expect(res.body).toMatchObject({ error: 'Validation error' });
		expect(res.body.details.join(' | ')).toMatch(/complaint/);
	});

	test('with empty string complaint returns 400', async () => {
		const body = minimalBody({ complaint: '' });
		const res = await request(app).post('/analyze-ticket').send(body);
		expect(res.status).toBe(400);
		expect(res.body.details.join(' | ')).toMatch(/complaint/);
	});

	test('with invalid JSON returns 400', async () => {
		const res = await request(app)
		.post('/analyze-ticket')
		.set('Content-Type', 'application/json')
		.send('{ "ticket_id": "TKT-1", "complaint": '); // malformed
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('error');
	});

	test('with valid body including full transaction_history returns 200', async () => {
		const res = await request(app).post('/analyze-ticket').send(fullBody());
		expect(res.status).toBe(200);
		expect(res.body.ticket_id).toBe('TKT-2002');
	});

	test('with empty transaction_history returns 200 (allowed by schema)', async () => {
		const body = minimalBody({ transaction_history: [] });
		const res = await request(app).post('/analyze-ticket').send(body);
		expect(res.status).toBe(200);
	});

	test('response evidence_verdict is one of the valid enum values', async () => {
		const res = await request(app).post('/analyze-ticket').send(minimalBody());
		expect(res.status).toBe(200);
		expect(Object.values(EVIDENCE_VERDICT)).toContain(res.body.evidence_verdict);
	});

	test('response case_type is one of the valid enum values', async () => {
		const res = await request(app).post('/analyze-ticket').send(minimalBody());
		expect(res.status).toBe(200);
		expect(Object.values(CASE_TYPE)).toContain(res.body.case_type);
	});

	test('response department is one of the valid enum values', async () => {
		const res = await request(app).post('/analyze-ticket').send(minimalBody());
		expect(res.status).toBe(200);
		expect(Object.values(DEPARTMENT)).toContain(res.body.department);
	});

	test('customer_reply does not ask the customer for their PIN or OTP', async () => {
		const res = await request(app).post('/analyze-ticket').send(minimalBody());
		expect(res.status).toBe(200);
		const reply = String(res.body.customer_reply || '').toLowerCase();

		const sentences = reply.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);

		const askVerbs =
		'(?:please\\s+)?(?:send|share|provide|give|tell|enter|type|submit|reply\\s+with|confirm|verify)';
		const askPattern = new RegExp(
		`\\b${askVerbs}\\b[^.!?]*\\b(?:your\\s+|me\\s+your\\s+|the\\s+)?(?:pin|otp)\\b`
		);
		const negationPattern =
		/^\s*(?:please\s+)?(?:do\s+not|don['']t|never|refrain\s+from|avoid)/;

		for (const sentence of sentences) {
			if (negationPattern.test(sentence)) {
				continue;
			}
			expect(sentence).not.toMatch(askPattern);
		}
	});
});
