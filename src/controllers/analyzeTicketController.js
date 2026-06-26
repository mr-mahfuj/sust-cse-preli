'use strict';

const { validateResponse } = require('../models');

/**
 * Build a hardcoded response that satisfies the output schema.
 *
 * TODO: Replace with real investigator in Step 5
 * Until then this exists so the HTTP contract, validation,
 * and downstream wiring can be exercised end-to-end.
 */
function buildStubResponse(ticketId) {
  return {
    ticket_id: ticketId,
    relevant_transaction_id: null,
    evidence_verdict: 'insufficient_data',
    case_type: 'other',
    severity: 'low',
    department: 'customer_support',
    agent_summary: 'Stub response for testing schema compliance.',
    recommended_next_action: 'No action required for stub.',
    customer_reply:
      'Thank you for reaching out. Our team will review your case. Please do not share your PIN or OTP with anyone.',
    human_review_required: false,
    confidence: 0.5,
    reason_codes: ['stub'],
  };
}

/**
 * POST /analyze-ticket controller.
 *
 * Contract:
 *   - reads ticket_id from req.body
 *   - delegates the actual investigation to a builder (stub for now)
 *   - validates the outgoing response against the response schema
 *   - on validation failure or any thrown error, forwards to next(err)
 *   - on success, responds 200 with the JSON body
 */
async function analyzeTicketController(req, res, next) {
  try {
    const ticketId = req.body && req.body.ticket_id;

    const response = buildStubResponse(ticketId);

    const validation = validateResponse(response);
    if (!validation.valid) {
      // eslint-disable-next-line no-console
      console.error(
        'analyzeTicketController: response failed schema validation:',
        validation.errors
      );
      const err = new Error('Response schema validation failed');
      err.statusCode = 500;
      err.details = validation.errors;
      return next(err);
    }

    return res.status(200).json(response);
  } catch (err) {
    return next(err);
  }
}

module.exports = analyzeTicketController;
