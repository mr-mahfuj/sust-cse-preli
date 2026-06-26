# QueueStorm - AI-Powered Digital Wallet Dispute Investigator

## Overview

QueueStorm is an AI-assisted customer support investigation system built using **Node.js** and **Express.js**. It analyzes customer complaints related to digital wallet transactions, combines rule-based reasoning with an LLM, validates AI responses, and returns a structured investigation report.

The system helps customer support teams triage complaints faster while maintaining safety through schema validation, deterministic business rules, retry mechanisms, and fallback handling.


## Features

- AI-powered complaint investigation
- Rule-based complaint classification
- English, Bangla, and mixed-language detection
- Transaction matching using complaint details
- JSON schema validation for requests and responses
- Retry mechanism for invalid LLM responses
- Safe fallback response when AI fails
- Safety guard to prevent unsafe customer replies
- Structured API responses
- Modular architecture


## Technology Stack

- Node.js
- Express.js
- Joi
- Groq API (LLM)
- JavaScript (CommonJS)


## Project Structure

```text
.
├── src
│   ├── config
│   ├── controllers
│   ├── core
│   │   ├── investigator.js
│   │   ├── languageDetector.js
│   │   ├── ruleEngine.js
│   │   ├── transactionMatcher.js
│   │   ├── promptBuilder.js
│   │   ├── responseParser.js
│   │   ├── fallbackResponse.js
│   │   └── safetyGuard.js
│   ├── middleware
│   ├── models
│   ├── prompts
│   ├── routes
│   ├── services
│   └── validation
├── .env.example
├── index.js
├── package.json
└── README.md
````

## System Workflow

```text
Client Request
      │
      ▼
Request Validation
      │
      ▼
Language Detection
      │
      ▼
Rule Engine
      │
      ▼
Transaction Matcher
      │
      ▼
Prompt Builder
      │
      ▼
Groq LLM
      │
      ▼
Response Parser
      │
      ▼
Schema Validation
      │
      ▼
Safety Guard
      │
      ▼
Final Response
```

## Installation

### Clone the Repository

```bash
git clone <repository-url>
cd sust-cse-preli
```

### Install Dependencies

```bash
npm install
```


## Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
GROQ_API_KEY=YOUR_GROQ_API_KEY
```


## Running the Project

### Start the Development Server

```bash
npm start
```

The server will start at:

```text
http://localhost:3000
```


## API Endpoint

### POST `/analyze-ticket`

Analyzes a customer complaint and returns a structured investigation report.

### Request Body

```json
{
  "ticket_id": "CASE-100",
  "complaint": "Money was deducted but the receiver did not receive it.",
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


### Sample Response

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

## Validation

Incoming requests are validated using **Joi**.

Validation ensures:

* `ticket_id` is required
* `complaint` is required
* Language value is valid
* Transaction history follows the expected schema

Every AI response is also validated before being returned to the client.


## AI Investigation Pipeline

The investigation process combines deterministic business logic with AI reasoning.

### Language Detection

Supports detection of:

* English
* Bangla
* Mixed Language

### Rule Engine

Extracts complaint indicators such as:

* Wrong transfer
* Refund request
* Payment failure
* Duplicate payment
* Merchant settlement delay
* Agent cash-in issue
* Fraud / phishing

### Transaction Matcher

Scores transactions based on:

* Amount matching
* Phone number matching
* Transaction type
* Transaction status

Returns the most relevant transaction for the investigation.

### Prompt Builder

Constructs a structured prompt containing:

* Customer complaint
* Rule engine output
* Matched transaction
* Investigation instructions
* Allowed enum values
* Expected JSON schema

### Response Parser

* Safely extracts JSON from the LLM response
* Rejects malformed or invalid outputs

### Safety Guard

Ensures:

* Security reminders are included
* Required fields are present
* Safe defaults are applied when necessary

### Fallback Mechanism

If the AI fails due to:

* Timeout
* Parsing errors
* Invalid JSON
* Schema validation failures

QueueStorm returns a safe fallback response instead of exposing internal errors.


## Testing

Example request:

```bash
curl -X POST http://localhost:3000/analyze-ticket \
-H "Content-Type: application/json" \
-d '{
  "ticket_id":"CASE-100",
  "complaint":"Money was deducted but the receiver did not receive it."
}'
```


## Design Decisions

* Hybrid AI + rule-based architecture for improved reliability
* Schema validation before returning AI responses
* Retry mechanism for malformed LLM outputs
* Deterministic transaction matching to reduce hallucinations
* Modular project structure for scalability and maintainability


## Future Improvements

* Multiple candidate transaction ranking
* Vector-based semantic complaint search
* Database integration
* Authentication and authorization
* Complaint history and analytics dashboard
* Multilingual response generation
* Automated evaluation metrics


## Team

Developed for the **SUST Hackathon Preliminary Round**.

QueueStorm demonstrates how deterministic business rules and modern LLMs can be combined to build a **safe**, **reliable**, and **explainable** customer support investigation system.```
