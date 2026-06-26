'use strict';

const callLLM = require('../services/llmClient');
const analyzeComplaint = require('./ruleEngine');
const detectLanguage = require('./languageDetector');
const matchTransaction = require('./transactionMatcher');
const buildPrompt = require('./promptBuilder');
const parseLLMResponse = require('./responseParser');
const fallbackResponse = require('./fallbackResponse');
const applySafetyGuard = require('./safetyGuard');

const { validateResponse } = require('../models');

const SYSTEM_PROMPT = `
You are an expert digital wallet dispute investigator.

Your job is to investigate customer complaints accurately.

Rules:

- Return ONLY valid JSON.
- Never use markdown.
- Never explain your reasoning.
- Never invent transactions.
- Follow the provided JSON schema exactly.
- Populate every required field.
- Use only the allowed enum values.
- If evidence is insufficient, use "insufficient_data".
`;

async function callWithRetry(userPrompt) {
    try {
        return await callLLM({
            systemPrompt: SYSTEM_PROMPT,
            userPrompt
        });
    } catch (err) {

        return await callLLM({
            systemPrompt: SYSTEM_PROMPT,
            userPrompt:
                userPrompt +
                '\n\nIMPORTANT: Your previous response was invalid. Return ONLY valid JSON.'
        });
    }
}

async function investigate(ticket) {

    try {

        const language =
            detectLanguage(ticket.complaint);


        const ruleAnalysis =
            analyzeComplaint(ticket.complaint);

        const transaction =
            matchTransaction(
                ticket.complaint,
                ticket.transaction_history || []
            );

   
        const prompt =
            buildPrompt({

                ticketId:
                    ticket.ticket_id,

                complaint:
                    ticket.complaint,

                language,

                transaction,

                ruleAnalysis

            });


        const llmText =
            await callWithRetry(prompt);


        let result =
            parseLLMResponse(llmText);


        if (
            ruleAnalysis.suspected_case !== 'other' &&
            result.case_type === 'other'
        ) {
            result.case_type =
                ruleAnalysis.suspected_case;
        }

        if (
            ruleAnalysis.severity === 'high'
        ) {
            result.severity = 'high';
        }

        if (
            ruleAnalysis.human_review
        ) {
            result.human_review_required = true;
        }

        const validation =
            validateResponse(result);

        if (!validation.valid) {

            throw new Error(
                validation.errors.join(', ')
            );

        }


        result =
            applySafetyGuard(result);

        return result;

    }
    catch (err) {

        return fallbackResponse(
            ticket.ticket_id
        );
    }
}

module.exports = investigate;