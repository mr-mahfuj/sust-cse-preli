'use strict';

const KEYWORDS = {

    refund: [
        'refund',
        'refund request',
        'রিফান্ড',
        'ফেরত'
    ],

    wrong_transfer: [
        'wrong transfer',
        'wrong number',
        'wrong account',
        'sent to wrong',
        'accidentally sent',
        'ভুল নম্বরে',
        'ভুল নাম্বারে',
        'ভুলে পাঠিয়েছি',
        'ভুলে টাকা পাঠিয়েছি',
        'ভুল একাউন্টে'
    ],

    deducted: [
        'money deducted',
        'deducted',
        'balance deducted',
        'amount deducted',
        'কেটে গেছে',
        'টাকা কেটে গেছে'
    ],

    payment_failed: [
        'payment failed',
        'failed payment',
        'transaction failed',
        'payment unsuccessful',
        'লেনদেন ব্যর্থ',
        'পেমেন্ট হয়নি'
    ],

    receiver_not_received: [
        "didn't receive",
        "did not receive",
        "not receive",
        "receiver not received",
        "receiver didn't get",
        "receiver did not get",
        "recipient did not receive",
        "recipient didn't receive",
        "পায়নি",
        "পৌঁছায়নি",
        "পায় নি"
    ],

    duplicate_payment: [
        'duplicate',
        'duplicate payment',
        'paid twice',
        'double payment',
        'দুইবার',
        'দ্বিতীয়বার',
        'দুইবার টাকা'
    ],

    merchant_settlement_delay: [
        'merchant',
        'merchant payment',
        'settlement',
        'merchant not received',
        'মার্চেন্ট',
        'সেটেলমেন্ট'
    ],

    agent_cash_in_issue: [
        'cash in',
        'cashin',
        'agent',
        'agent cash in',
        'এজেন্ট',
        'ক্যাশ ইন'
    ],

    fraud: [
        'otp',
        'pin',
        'password',
        'verification code',
        'scam',
        'fraud',
        'phishing',
        'social engineering',
        'প্রতারণা',
        'জালিয়াতি',
        'ওটিপি'
    ]

};

function hasKeyword(text, keywords) {
    return keywords.some(keyword =>
        text.includes(keyword.toLowerCase())
    );
}

function setCase(result, newCase, priority) {
    if (priority > result.priority) {
        result.priority = priority;
        result.suspected_case = newCase;
    }
}

function analyzeComplaint(complaint = '') {

    const text = complaint.toLowerCase().trim();

    const result = {
        suspected_case: 'other',
        severity: 'low',
        human_review: false,
        keywords: [],
        priority: 0
    };

    if (hasKeyword(text, KEYWORDS.wrong_transfer)) {
        setCase(result, 'wrong_transfer', 80);
        result.keywords.push('wrong_transfer');
    }

    if (hasKeyword(text, KEYWORDS.refund)) {
        setCase(result, 'refund_request', 50);
        result.keywords.push('refund');
    }

    const deducted = hasKeyword(text, KEYWORDS.deducted);

    const failed =
        hasKeyword(text, KEYWORDS.payment_failed) ||
        hasKeyword(text, KEYWORDS.receiver_not_received);

    if (deducted && failed) {
        setCase(result, 'payment_failed', 60);
        result.keywords.push('payment_failed');
    }

    if (hasKeyword(text, KEYWORDS.duplicate_payment)) {
        setCase(result, 'duplicate_payment', 70);
        result.keywords.push('duplicate_payment');
    }

    if (hasKeyword(text, KEYWORDS.merchant_settlement_delay)) {
        setCase(result, 'merchant_settlement_delay', 40);
        result.keywords.push('merchant_settlement_delay');
    }

    if (hasKeyword(text, KEYWORDS.agent_cash_in_issue)) {
        setCase(result, 'agent_cash_in_issue', 30);
        result.keywords.push('agent_cash_in_issue');
    }

    if (hasKeyword(text, KEYWORDS.receiver_not_received)) {
        result.keywords.push('receiver_not_received');
    }

    if (hasKeyword(text, KEYWORDS.fraud)) {
        setCase(result, 'phishing_or_social_engineering', 100);
        result.severity = 'high';
        result.human_review = true;
        result.keywords.push('fraud');
    }

    if (result.severity === 'low' && result.keywords.length >= 3) {
        result.severity = 'medium';
    }

    if (result.severity === 'medium' && result.keywords.length >= 5) {
        result.severity = 'high';
    }

    delete result.priority;

    return result;
}

module.exports = analyzeComplaint;