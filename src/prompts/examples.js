'use strict';

const EXAMPLES = `
Example 1

Complaint:
"I accidentally sent money to the wrong number."

Transaction:
{
  "transaction_id":"TX100",
  "status":"completed",
  "type":"transfer"
}

Expected JSON:

{
  "ticket_id":"EXAMPLE-1",
  "relevant_transaction_id":"TX100",
  "evidence_verdict":"consistent",
  "case_type":"wrong_transfer",
  "severity":"medium",
  "department":"dispute_resolution",
  "agent_summary":"Customer transferred money to the wrong recipient. Transaction completed successfully.",
  "recommended_next_action":"Verify customer ownership details and initiate dispute workflow if eligible.",
  "customer_reply":"We understand the transfer reached an unintended recipient. Our team will review the case and update you shortly. Please never share your PIN or OTP.",
  "human_review_required":true,
  "confidence":0.93,
  "reason_codes":[
      "matched_transaction",
      "completed_transfer"
  ]
}

----------------------------------------------------

Example 2

Complaint:
"Money was deducted but the payment failed."

Transaction:
{
  "transaction_id":"TX200",
  "status":"failed",
  "type":"merchant_payment"
}

Expected JSON:

{
  "ticket_id":"EXAMPLE-2",
  "relevant_transaction_id":"TX200",
  "evidence_verdict":"consistent",
  "case_type":"payment_failed",
  "severity":"medium",
  "department":"payments_ops",
  "agent_summary":"Failed merchant payment matches customer complaint.",
  "recommended_next_action":"Verify settlement status and reverse funds if necessary.",
  "customer_reply":"Your payment appears to have failed. Our team is verifying the transaction and will keep you informed. Please never share your PIN or OTP.",
  "human_review_required":false,
  "confidence":0.96,
  "reason_codes":[
      "matched_transaction",
      "failed_payment"
  ]
}
`;

module.exports = EXAMPLES;