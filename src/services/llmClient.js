'use strict';

const Groq = require('groq-sdk');
const config = require('../config');

const MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_MAX_TOKENS = 1000;
const TIMEOUT_MS = 25000;

const client = new Groq({
  apiKey: config.GROQ_API_KEY,
});

async function callLLM({
  systemPrompt,
  userPrompt,
  maxTokens = DEFAULT_MAX_TOKENS,
}) {

  if (
    typeof systemPrompt !== 'string' ||
    typeof userPrompt !== 'string'
  ) {
    throw new Error(
      'LLM service error: systemPrompt and userPrompt must be strings'
    );
  }

  const requestPromise = client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.2,
    max_tokens: maxTokens,
  });

  let timer;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('LLM service timeout'));
    }, TIMEOUT_MS);
  });

  try {

    const response = await Promise.race([
      requestPromise,
      timeoutPromise,
    ]);

    const text =
      response.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Empty response from Groq');
    }

    return text;

  } catch (err) {

    throw new Error(
      'LLM service error: ' +
      (err.message || String(err))
    );

  } finally {

    clearTimeout(timer);

  }

}

module.exports = callLLM;