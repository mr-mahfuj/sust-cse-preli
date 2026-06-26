'use strict';

const Joi = require('joi');

const {
  LANGUAGE,
  CHANNEL,
  USER_TYPE,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
} = require('./enums');

const languageValues = Object.values(LANGUAGE);
const channelValues = Object.values(CHANNEL);
const userTypeValues = Object.values(USER_TYPE);
const transactionTypeValues = Object.values(TRANSACTION_TYPE);
const transactionStatusValues = Object.values(TRANSACTION_STATUS);

const transactionItemSchema = Joi.object({
  transaction_id: Joi.string().required(),
  timestamp: Joi.string().isoDate().required(),
  type: Joi.string()
    .valid(...transactionTypeValues)
    .required(),
  amount: Joi.number().positive().required(),
  counterparty: Joi.string().required(),
  status: Joi.string()
    .valid(...transactionStatusValues)
    .required(),
});

const requestSchema = Joi.object({
  ticket_id: Joi.string().required(),
  complaint: Joi.string().min(1).required(),

  language: Joi.string().valid(...languageValues),
  channel: Joi.string().valid(...channelValues),
  user_type: Joi.string().valid(...userTypeValues),

  campaign_context: Joi.string(),
  transaction_history: Joi.array().items(transactionItemSchema),
  metadata: Joi.object().unknown(true),
}).options({
  abortEarly: false,
  stripUnknown: false,
  convert: true,
});

module.exports = requestSchema;
