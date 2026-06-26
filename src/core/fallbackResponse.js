'use strict';

function fallbackResponse(ticketId) {
    return {
        ticket_id: ticketId,
        relevant_transaction_id: null,
        evidence_verdict: "insufficient_data",
        case_type: "other",
        severity: "medium",
        department: "customer_support",
        agent_summary:
            "Automated investigation could not complete. Manual review required.",
        recommended_next_action:
            "Assign this ticket to a human support agent.",
        customer_reply:
            "Thank you for contacting us. Your request has been forwarded for manual review. Please never share your PIN, OTP, or password with anyone.",
        human_review_required: true,
        confidence: 0,
        reason_codes: [
            "llm_failure"
        ]
    };
}

module.exports = fallbackResponse;