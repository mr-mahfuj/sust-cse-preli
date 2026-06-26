'use strict';

const PORT = Number(process.env.PORT) || 3000;

const GROQ_API_KEY = process.env.GROQ_API_KEY;

require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
};