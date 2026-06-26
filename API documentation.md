# API Documentation

This document describes all available API endpoints exposed by QueueStorm.

**Base URL**

```text
http://localhost:3000
```

---

# Health Check

## GET /

Checks whether the API server is running.

### Request

```http
GET /
```

### Request Body

None

### Success Response

```json
{
  "message": "QueueStorm API is running"
}
```

### Status Codes

| Code | Description       |
| ---- | ----------------- |
| 200  | Server is running |

---

# Request Validation Test

## POST /test

Used for testing request validation only.

This endpoint validates the incoming request body but does **not** perform any AI investigation.

---

## Request

```http
POST /test
Content-Type: application/json
```

### Request Body

| Field               | Type   | Required | Description                    |
| ------------------- | ------ | -------- | ------------------------------ |
| ticket_id           | string | ✅        | Unique ticket identifier       |
| complaint           | string | ✅        | Customer complaint             |
| language            | string | ❌        | `en`, `bn`, or `mixed`         |
| transaction_history | array  | ❌        | Previous customer transactions |

---

### Example Request

```json
{
  "ticket_id": "CASE-100",
  "complaint": "Money deducted but receiver did not receive it."
}
```

---

### Success Response

```json
{
  "success": true
}
```

---

### Validation Error

```json
{
  "error": "Validation error",
  "details": [
    "\"complaint\" is required"
  ]
}
```

---

### Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Validation successful |
| 400  | Invalid request body  |

---

# AI Ticket Investigation

## POST /analyze-ticket

Analyzes a customer complaint using:

* Rule Engine
* Language Detection
* Transaction Matching
* Large Language Model
* Safety Guard
* Response Validation

Returns a structured investigation report.

---

## Request

```http
POST /analyze-ticket
Content-Type: application/json
```

---

## Request Body

| Field               | Type   | Required | Description                  |
| ------------------- | ------ | -------- | ---------------------------- |
| ticket_id           | string | ✅        | Unique complaint ID          |
| complaint           | string | ✅        | Customer complaint           |
| language            | string | ❌        | `en`, `bn`, or `mixed`       |
| transaction_history | array  | ❌        | Customer transaction history |

---

## Transaction Object

Each transaction inside `transaction_history` should contain:

| Field          | Type   | Required | Description                   |
| -------------- | ------ | -------- | ----------------------------- |
| transaction_id | string | ✅        | Transaction identifier        |
| timestamp      | string | ✅        | ISO 8601 timestamp            |
| amount         | number | ✅        | Transaction amount            |
| counterparty   | string | ✅        | Receiver or sender identifier |
| type           | string | ✅        | Transaction type              |
| status         | string | ✅        | Transaction status            |

---

## Example Request

```json
{
  "ticket_id": "CASE-100",
  "complaint": "I sent 500 taka to 01712345678 but the receiver did not receive it.",
  "transaction_history": [
    {
      "transaction_id": "TX100",
      "timestamp": "2026-06-26T10:00:00Z",
      "amount": 500,
      "counterparty": "01712345678",
      "type": "transfer",
      "status": "completed"
    }
  ]
}
```

---

## Success Response

```json
{
  "ticket_id": "CASE-100",
  "relevant_transaction_id": "TX100",
  "evidence_verdict": "consistent",
  "case_type": "payment_failed",
  "severity": "medium",
  "department": "payments_ops",
  "agent_summary": "Customer reports that the receiver did not receive the transferred funds despite a completed transaction.",
  "recommended_next_action": "Verify settlement status and investigate payment processing.",
  "customer_reply": "Thank you for contacting us. We are investigating your transaction and will update you shortly. Please never share your PIN or OTP with anyone.",
  "human_review_required": true,
  "confidence": 0.91,
  "reason_codes": [
    "matched_transaction",
    "receiver_not_received"
  ]
}
```

---

## Response Fields

| Field                   | Type          | Description                                          |
| ----------------------- | ------------- | ---------------------------------------------------- |
| ticket_id               | string        | Original ticket identifier                           |
| relevant_transaction_id | string | null | Best matched transaction                             |
| evidence_verdict        | string        | `consistent`, `inconsistent`, or `insufficient_data` |
| case_type               | string        | Predicted complaint category                         |
| severity                | string        | `low`, `medium`, `high`, `critical`                  |
| department              | string        | Department responsible for handling the case         |
| agent_summary           | string        | Internal investigation summary                       |
| recommended_next_action | string        | Suggested operational action                         |
| customer_reply          | string        | Safe response to send to the customer                |
| human_review_required   | boolean       | Indicates whether manual review is needed            |
| confidence              | number        | AI confidence score between 0 and 1                  |
| reason_codes            | array         | Machine-readable explanation codes                   |

---

## Possible Case Types

* wrong_transfer
* payment_failed
* refund_request
* duplicate_payment
* merchant_settlement_delay
* agent_cash_in_issue
* phishing_or_social_engineering
* other

---

## Possible Departments

* customer_support
* dispute_resolution
* payments_ops
* merchant_operations
* agent_operations
* fraud_risk

---

## Evidence Verdict

Possible values:

* consistent
* inconsistent
* insufficient_data

---

## Error Response

```json
{
  "error": "Validation error",
  "details": [
    "\"ticket_id\" is required"
  ]
}
```

or

```json
{
  "error": "Internal Server Error"
}
```

---

## Status Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 200  | Investigation completed successfully |
| 400  | Invalid request                      |
| 500  | Internal server error                |

---

# Error Format

All API errors follow the same structure.

```json
{
  "error": "Error message",
  "details": [
    "Detailed validation errors"
  ]
}
```

---

# Supported Languages

QueueStorm supports complaints written in:

* English
* Bangla
* Mixed English-Bangla

Language detection is performed automatically before investigation.

---

# Notes

* `transaction_history` is optional.
* If no transaction matches the complaint, `relevant_transaction_id` will be `null`.
* If the AI cannot produce a valid response, QueueStorm returns a safe fallback response.
* All AI-generated responses are validated against a predefined schema before being returned.
