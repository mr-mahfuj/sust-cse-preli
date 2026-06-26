'use strict';

// Mock the SDK BEFORE requiring llmClient.
// The real `require('@anthropic-ai/sdk')` returns the Anthropic class
// (a function). We mirror that: module.exports is a callable that we
// instrument; the mock fns hang off of it as properties so the test
// file can reach them.
jest.mock('@anthropic-ai/sdk', () => {
  const createMock = jest.fn();
  const AnthropicMock = jest.fn().mockImplementation(() => ({
    messages: { create: createMock },
  }));
  // Make the module's default export callable AND keep the mocks reachable.
  Object.assign(AnthropicMock, { __createMock: createMock });
  return AnthropicMock;
});

const AnthropicMock = require('@anthropic-ai/sdk');
const createMock = AnthropicMock.__createMock;

const callLLM = require('../src/services/llmClient');

const TEST_API_KEY = 'test-anthropic-key-12345';

describe('llmClient.callLLM', () => {
  beforeEach(() => {
    createMock.mockReset();
    AnthropicMock.mockClear();
    process.env.ANTHROPIC_API_KEY = TEST_API_KEY;
  });

  test('returns the text from the first content block', async () => {
    createMock.mockResolvedValueOnce({
      content: [
        { type: 'text', text: 'hello world' },
        { type: 'text', text: 'second block' },
      ],
    });

    const result = await callLLM({
      systemPrompt: 'be terse',
      userPrompt: 'say hi',
    });

    expect(typeof result).toBe('string');
    expect(result).toBe('hello world');
  });

  test('passes model "claude-sonnet-4-6" to the SDK', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'ok' }],
    });

    await callLLM({ systemPrompt: 'sys', userPrompt: 'usr' });

    expect(createMock).toHaveBeenCalledTimes(1);
    const params = createMock.mock.calls[0][0];
    expect(params.model).toBe('claude-sonnet-4-6');
  });

  test('passes systemPrompt as the "system" field', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'ok' }],
    });

    await callLLM({
      systemPrompt: 'you are a helpful investigator',
      userPrompt: 'classify this',
    });

    const params = createMock.mock.calls[0][0];
    expect(params.system).toBe('you are a helpful investigator');
  });

  test('passes userPrompt as the user message content', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'ok' }],
    });

    await callLLM({
      systemPrompt: 'sys',
      userPrompt: 'please classify ticket T-1',
    });

    const params = createMock.mock.calls[0][0];
    expect(params.messages).toEqual([
      { role: 'user', content: 'please classify ticket T-1' },
    ]);
  });

  test('uses max_tokens from the maxTokens option (default 1000)', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'ok' }],
    });

    await callLLM({ systemPrompt: 'sys', userPrompt: 'usr' });
    expect(createMock.mock.calls[0][0].max_tokens).toBe(1000);

    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'ok' }],
    });
    await callLLM({ systemPrompt: 'sys', userPrompt: 'usr', maxTokens: 250 });
    expect(createMock.mock.calls[1][0].max_tokens).toBe(250);
  });

  test('instantiates Anthropic with ANTHROPIC_API_KEY from config', async () => {
    expect(AnthropicMock).toHaveBeenCalledTimes(0);

    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'ok' }],
    });

    await callLLM({ systemPrompt: 'sys', userPrompt: 'usr' });

    expect(AnthropicMock).toHaveBeenCalledTimes(1);
    const initArg = AnthropicMock.mock.calls[0][0];
    expect(initArg).toBeDefined();
    expect(initArg.apiKey).toBe(TEST_API_KEY);
  });

  test('wraps SDK errors as "LLM service error: ..."', async () => {
    createMock.mockRejectedValueOnce(new Error('boom from sdk'));

    await expect(
      callLLM({ systemPrompt: 'sys', userPrompt: 'usr' })
    ).rejects.toThrow('LLM service error: boom from sdk');
  });

  test('error message does NOT include the API key', async () => {
    createMock.mockRejectedValueOnce(new Error('boom from sdk'));

    try {
      await callLLM({ systemPrompt: 'sys', userPrompt: 'usr' });
      throw new Error('expected callLLM to throw');
    } catch (err) {
      expect(err.message).toBe('LLM service error: boom from sdk');
      expect(err.message).not.toMatch(TEST_API_KEY);
      expect(err.message).not.toMatch(/ANTHROPIC_API_KEY/i);
    }
  });

  test('throws "LLM service timeout" when SDK takes longer than 25s', async () => {
    jest.useFakeTimers();
    try {
      createMock.mockReturnValueOnce(new Promise(() => {}));

      const promise = callLLM({ systemPrompt: 'sys', userPrompt: 'usr' });
      // Swallow the eventual rejection before advancing timers so the test
      // process doesn't see an unhandled rejection.
      promise.catch(() => {});
      jest.advanceTimersByTime(25001);

      await expect(promise).rejects.toThrow('LLM service timeout');
    } finally {
      jest.useRealTimers();
    }
  });

  test('returns the full text when only one content block exists', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'lonely block of text' }],
    });

    const result = await callLLM({
      systemPrompt: 'sys',
      userPrompt: 'usr',
      maxTokens: 500,
    });

    expect(result).toBe('lonely block of text');
  });
});
