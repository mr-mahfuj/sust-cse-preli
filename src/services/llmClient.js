'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const config = require('../config');

const MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 1000;
const TIMEOUT_MS = 25000;

/**
 * Call the Anthropic Claude API and return the model's text reply.
 *
 * @param {Object} params
 * @param {string} params.systemPrompt - System prompt for the model.
 * @param {string} params.userPrompt - User prompt content.
 * @param {number} [params.maxTokens=1000] - Maximum tokens to generate.
 * @returns {Promise<string>} The first text block from the model response.
 */
async function callLLM({ systemPrompt, userPrompt, maxTokens = DEFAULT_MAX_TOKENS }) {
  if (typeof systemPrompt !== 'string' || typeof userPrompt !== 'string') {
    throw new Error('LLM service error: systemPrompt and userPrompt must be strings');
  }

  // Read the key from config at call time so tests can flip process.env
  // between cases without re-requiring the config module.
  const apiKey = config.ANTHROPIC_API_KEY;
  const client = new Anthropic({ apiKey });

  const requestPromise = client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('LLM service timeout'));
    }, TIMEOUT_MS);
  });

  try {
    const response = await Promise.race([requestPromise, timeoutPromise]);
    const firstBlock = Array.isArray(response && response.content)
      ? response.content[0]
      : undefined;
    if (!firstBlock || typeof firstBlock.text !== 'string') {
      throw new Error('LLM service error: empty response from Anthropic');
    }
    return firstBlock.text;
  } catch (err) {
    if (err && err.message === 'LLM service timeout') {
      throw new Error('LLM service timeout');
    }
    throw new Error('LLM service error: ' + (err && err.message ? err.message : String(err)));
  } finally {
    clearTimeout(timer);
  }
}

module.exports = callLLM;