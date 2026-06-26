'use strict';

const {
  EVIDENCE_VERDICT,
  CASE_TYPE,
  SEVERITY,
  DEPARTMENT,
} = require('./enums');

const evidenceVerdictValues = new Set(Object.values(EVIDENCE_VERDICT));
const caseTypeValues = new Set(Object.values(CASE_TYPE));
const severityValues = new Set(Object.values(SEVERITY));
const departmentValues = new Set(Object.values(DEPARTMENT));

function isString(value) {
  return typeof value === 'string';
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

/**
 * Validate the shape and value-set of an investigation response object.
 *
 * Returns one of:
 *   { valid: true }
 *   { valid: false, errors: string[] }
 *
 * No external validation library is used here — output enforcement is pure JS
 * by design so that downstream producers (LLM agent, internal services, etc.)
 * can be checked against the contract without depending on Joi at the edge.
 */
function validateResponse(obj) {
  const errors = [];

  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return {
      valid: false,
      errors: ['response must be a non-null object'],
    };
  }

  // ticket_id
  if (!Object.prototype.hasOwnProperty.call(obj, 'ticket_id')) {
    errors.push('ticket_id is required');
  } else if (!isString(obj.ticket_id)) {
    errors.push('ticket_id must be a string');
  }

  // relevant_transaction_id (string or null)
  if (!Object.prototype.hasOwnProperty.call(obj, 'relevant_transaction_id')) {
    errors.push('relevant_transaction_id is required');
  } else if (
    obj.relevant_transaction_id !== null &&
    !isString(obj.relevant_transaction_id)
  ) {
    errors.push('relevant_transaction_id must be a string or null');
  }

  // evidence_verdict
  if (!Object.prototype.hasOwnProperty.call(obj, 'evidence_verdict')) {
    errors.push('evidence_verdict is required');
  } else if (
    !isString(obj.evidence_verdict) ||
    !evidenceVerdictValues.has(obj.evidence_verdict)
  ) {
    errors.push(
      `evidence_verdict must be one of: ${Array.from(evidenceVerdictValues).join(', ')}`
    );
  }

  // case_type
  if (!Object.prototype.hasOwnProperty.call(obj, 'case_type')) {
    errors.push('case_type is required');
  } else if (
    !isString(obj.case_type) ||
    !caseTypeValues.has(obj.case_type)
  ) {
    errors.push(
      `case_type must be one of: ${Array.from(caseTypeValues).join(', ')}`
    );
  }

  // severity
  if (!Object.prototype.hasOwnProperty.call(obj, 'severity')) {
    errors.push('severity is required');
  } else if (
    !isString(obj.severity) ||
    !severityValues.has(obj.severity)
  ) {
    errors.push(
      `severity must be one of: ${Array.from(severityValues).join(', ')}`
    );
  }

  // department
  if (!Object.prototype.hasOwnProperty.call(obj, 'department')) {
    errors.push('department is required');
  } else if (
    !isString(obj.department) ||
    !departmentValues.has(obj.department)
  ) {
    errors.push(
      `department must be one of: ${Array.from(departmentValues).join(', ')}`
    );
  }

  // agent_summary
  if (!Object.prototype.hasOwnProperty.call(obj, 'agent_summary')) {
    errors.push('agent_summary is required');
  } else if (!isString(obj.agent_summary)) {
    errors.push('agent_summary must be a string');
  }

  // recommended_next_action
  if (!Object.prototype.hasOwnProperty.call(obj, 'recommended_next_action')) {
    errors.push('recommended_next_action is required');
  } else if (!isString(obj.recommended_next_action)) {
    errors.push('recommended_next_action must be a string');
  }

  // customer_reply
  if (!Object.prototype.hasOwnProperty.call(obj, 'customer_reply')) {
    errors.push('customer_reply is required');
  } else if (!isString(obj.customer_reply)) {
    errors.push('customer_reply must be a string');
  }

  // human_review_required
  if (!Object.prototype.hasOwnProperty.call(obj, 'human_review_required')) {
    errors.push('human_review_required is required');
  } else if (!isBoolean(obj.human_review_required)) {
    errors.push('human_review_required must be a boolean');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true };
}

module.exports = { validateResponse };
