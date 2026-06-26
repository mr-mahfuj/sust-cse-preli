'use strict';

require('dotenv').config();

const express = require('express');

const config = require('./src/config');
const apiRouter = require('./src/routes');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  app.listen(config.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${config.PORT}`);
  });
}