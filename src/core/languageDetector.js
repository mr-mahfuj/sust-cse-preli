'use strict';

function detectLanguage(text = '') {
  if (!text || typeof text !== 'string') {
    return 'en';
  }

  // Bengali Unicode range
  const banglaChars = (text.match(/[\u0980-\u09FF]/g) || []).length;

  if (banglaChars > 0) {
    const ratio = banglaChars / text.length;

    if (ratio > 0.4) {
      return 'bn';
    }

    return 'mixed';
  }

  return 'en';
}

module.exports = detectLanguage;