export const testcases = [
  // --- Billing (charges, invoices, refunds, transaction caps) ---
  {
    input: "I was charged twice on my credit card for this month's subscription.",
    correct: "billing"
  },
  {
    input: "Where can I download the VAT tax invoice for last quarter?",
    correct: "billing"
  },
  {
    input: "I cancelled my plan last week but have not received my refund yet.",
    correct: "billing"
  },
  {
    input: "My account says past due, but the renewal fee was already deducted from my bank.",
    correct: "billing"
  },

  // --- Technical (bugs, crashes, functional errors, how-to-use) ---
  {
    input: "The app keeps crashing with error code 500 every time I open the dashboard.",
    correct: "technical"
  },
  {
    input: "How do I export my team analytics data to a CSV file from the settings page?",
    correct: "technical"
  },
  {
    input: "The mobile app is completely unresponsive on iOS 18 after the latest update.",
    correct: "technical"
  },
  {
    input: "How do I change my workspace display name and profile picture in the app?",
    correct: "technical"
  },

  // --- Other (account admin, policy, compliance, enterprise queries) ---
  {
    input: "Can I transfer workspace ownership to another administrator email address?",
    correct: "other"
  },
  {
    input: "Where can I find your SOC2 compliance report and data privacy terms?",
    correct: "other"
  },
  {
    input: "I want to permanently delete my account and purge all stored user data under GDPR.",
    correct: "other"
  },
  {
    input: "Does your enterprise plan support custom SSO via Okta or SAML?",
    correct: "other"
  },

  // --- Tie-Breakers (resolved by core user intent) ---
  {
    input: "A checkout page glitch caused a duplicate charge on my card; please issue a refund.",
    correct: "billing"
  },
  {
    input: "The subscription checkout button is frozen and throws a JavaScript error when clicked.",
    correct: "technical"
  },
  {
    input: "I am hitting a limit when transferring funds; how do I increase my transaction cap?",
    correct: "billing"
  }
];