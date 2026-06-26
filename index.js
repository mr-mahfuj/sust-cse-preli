'use strict';

require('dotenv').config();

const express = require('express');

const config = require('./src/config');
const apiRouter = require('./src/routes');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const { callLLM } = require("./src/services");

app.use(express.json());
app.use(apiRouter);
app.get("/llm-test", async (req, res) => {
  try {
    const text = await callLLM({
      systemPrompt: "You are a helpful assistant.",
      userPrompt: "Reply with exactly: Hello QueueStorm",
      maxTokens: 20,
    });

    res.json({ response: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
}