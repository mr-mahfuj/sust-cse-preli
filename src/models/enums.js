'use strict';

/**
 * Domain enums for QueueStorm Investigator.
 *
 * Each exported object is frozen so callers cannot mutate the canonical value
 * set at runtime. Use `Object.values(<enum>)` to get an array of valid values
 * for Joi `.valid(...)` lists.
 */

const LANGUAGE = Object.freeze({
  EN: 'en',
  BN: 'bn',
  MIXED: 'mixed',
});

const CHANNEL = Object.freeze({
  IN_APP_CHAT: 'in_app_chat',
  CALL_CENTER: 'call_center',
  EMAIL: 'email',
  MERCHANT_PORTAL: 'merchant_portal',
  FIELD_AGENT: 'field_agent',
});

const USER_TYPE = Object.freeze({
  CUSTOMER: 'customer',
  MERCHANT: 'merchant',
  AGENT: 'agent',
  UNKNOWN: 'unknown',
});

const TRANSACTION_TYPE = Object.freeze({
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
  CASH_IN: 'cash_in',
  CASH_OUT: 'cash_out',
  SETTLEMENT: 'settlement',
  REFUND: 'refund',
});

const TRANSACTION_STATUS = Object.freeze({
  COMPLETED: 'completed',
  FAILED: 'failed',
  PENDING: 'pending',
  REVERSED: 'reversed',
});

const EVIDENCE_VERDICT = Object.freeze({
  CONSISTENT: 'consistent',
  INCONSISTENT: 'inconsistent',
  INSUFFICIENT_DATA: 'insufficient_data',
});

const CASE_TYPE = Object.freeze({
  WRONG_TRANSFER: 'wrong_transfer',
  PAYMENT_FAILED: 'payment_failed',
  REFUND_REQUEST: 'refund_request',
  DUPLICATE_PAYMENT: 'duplicate_payment',
  MERCHANT_SETTLEMENT_DELAY: 'merchant_settlement_delay',
  AGENT_CASH_IN_ISSUE: 'agent_cash_in_issue',
  PHISHING_OR_SOCIAL_ENGINEERING: 'phishing_or_social_engineering',
  OTHER: 'other',
});

const SEVERITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

const DEPARTMENT = Object.freeze({
  CUSTOMER_SUPPORT: 'customer_support',
  DISPUTE_RESOLUTION: 'dispute_resolution',
  PAYMENTS_OPS: 'payments_ops',
  MERCHANT_OPERATIONS: 'merchant_operations',
  AGENT_OPERATIONS: 'agent_operations',
  FRAUD_RISK: 'fraud_risk',
});

module.exports = {
  LANGUAGE,
  CHANNEL,
  USER_TYPE,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  EVIDENCE_VERDICT,
  CASE_TYPE,
  SEVERITY,
  DEPARTMENT,
};
