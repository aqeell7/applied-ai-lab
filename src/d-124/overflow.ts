import { countTokens } from "./cost-estimator.js";
import OpenAI from "openai";
import 'dotenv/config';

const testPhrase = "This is a test of the context window limits. ";

// 1. Generate ~1.35 million tokens to guarantee an overflow
const giantString = testPhrase.repeat(150000);
const tokenCount = countTokens(giantString, "gpt-5-nano");

console.log(`Generated ${tokenCount} tokens.`);

// 2. The Safety Check: Only proceed if we are well past the 400k limit
if (tokenCount < 500000) {
    console.log("String isn't big enough to guarantee an overflow. Exiting.");
    process.exit(1);
}

console.log("Context window limit safely exceeded. Sending request...\n");

const openai = new OpenAI();

async function triggerOverflow() {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-5-nano", 
            messages: [{ role: "user", content: giantString }]
        });
        
        console.log("Wait, it succeeded? This shouldn't happen!");
        
    } catch (error: any) {
        // 4. Catch the error and print the exact fields required by the spec
        console.log("=== API ERROR CAUGHT ===");
        console.log(`Status: ${error.status}`);
        console.log(`Code: ${error.code}`);
        console.log(`Message: ${error.message}`);
    }
}

triggerOverflow();