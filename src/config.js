'use strict';

const PORT = Number(process.env.PORT) || 3000;

function getAnthropicApiKey() {
  return process.env.ANTHROPIC_API_KEY;
}

if (!process.env.ANTHROPIC_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[config] ANTHROPIC_API_KEY is not set. LLM calls will fail until it is provided.'
  );
}

module.exports = {
  PORT,
  // Exposed as a getter so the value reflects the current process.env at
  // read time (tests can flip it between cases without re-requiring config).
  get ANTHROPIC_API_KEY() {
    return getAnthropicApiKey();
  },
};