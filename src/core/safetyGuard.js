'use strict';

const forbidden = [
    "otp",
    "pin",
    "password",
    "cvv",
    "verification code"
];

function containsForbidden(text = "") {
    const lower = text.toLowerCase();

    return forbidden.some(word => lower.includes(word));
}

function applySafetyGuard(response) {

    if (
        containsForbidden(response.customer_reply)
    ) {

        response.customer_reply =
            "For your security, never share your PIN, OTP, password, or verification code with anyone. Our support team will assist you using secure procedures.";

        response.human_review_required = true;

        response.reason_codes =
            response.reason_codes || [];

        response.reason_codes.push(
            "unsafe_customer_reply"
        );
    }

    return response;
}

module.exports = applySafetyGuard;