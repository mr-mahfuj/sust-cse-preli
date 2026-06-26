'use strict';

function parseLLMResponse(text) {
    if (typeof text !== 'string') {
        throw new Error('LLM returned non-string response');
    }

    let cleaned = text.trim();

    // Remove markdown fences
    cleaned = cleaned.replace(/^```json/i, '');
    cleaned = cleaned.replace(/^```/i, '');
    cleaned = cleaned.replace(/```$/i, '');

    cleaned = cleaned.trim();

    // Extract JSON object if wrapped in text
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start !== -1 && end !== -1) {
        cleaned = cleaned.substring(start, end + 1);
    }

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        throw new Error(
            'LLM returned invalid JSON:\n' + cleaned
        );
    }
}

module.exports = parseLLMResponse;