'use strict';

const PHONE_REGEX = /\b01[3-9]\d{8}\b/g;
const MONEY_REGEX = /\b\d+(?:\.\d+)?\b/g;

function extractPhoneNumbers(text = '') {
    return text.match(PHONE_REGEX) || [];
}

function extractAmounts(text = '') {
    return (text.match(MONEY_REGEX) || []).map(Number);
}

function calculateScore(transaction, complaint) {
    let score = 0;

    const complaintLower = complaint.toLowerCase();

    const phones = extractPhoneNumbers(complaint);
    const amounts = extractAmounts(complaint);

    /* ------------------------------
       Phone number
    ------------------------------ */

    if (
        phones.length &&
        phones.includes(transaction.counterparty)
    ) {
        score += 50;
    }

    /* ------------------------------
       Amount
    ------------------------------ */

    if (
        amounts.length &&
        amounts.includes(transaction.amount)
    ) {
        score += 40;
    }

    /* ------------------------------
       Status
    ------------------------------ */

    if (
        complaintLower.includes("deduct") &&
        transaction.status === "completed"
    ) {
        score += 20;
    }

    if (
        complaintLower.includes("failed") &&
        transaction.status === "failed"
    ) {
        score += 20;
    }

    /* ------------------------------
       Transaction type
    ------------------------------ */

    if (
        complaintLower.includes("cash out") &&
        transaction.type === "cash_out"
    ) {
        score += 20;
    }

    if (
        complaintLower.includes("cash in") &&
        transaction.type === "cash_in"
    ) {
        score += 20;
    }

    if (
        complaintLower.includes("merchant") &&
        transaction.type === "merchant_payment"
    ) {
        score += 20;
    }

    if (
        complaintLower.includes("send") &&
        transaction.type === "transfer"
    ) {
        score += 20;
    }

    return score;
}

function matchTransaction(complaint, transactions = []) {

    if (!transactions.length)
        return null;

    let best = null;
    let bestScore = -1;

    for (const tx of transactions) {

        const score =
            calculateScore(tx, complaint);

        if (score > bestScore) {

            bestScore = score;
            best = tx;

        } else if(score === bestScore) {
            if(new Date(tx.timestamp) > new Date(best.timestamp)) {
                best = tx;
            }
        }

    }

    return best;
}

module.exports = matchTransaction;