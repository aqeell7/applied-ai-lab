import { retryWithBackoff } from "./backoff.js";

// PRIMARY provider — rigged to always fail with a 429 so we can watch retries + fallback.
async function callPrimaryProvider(prompt: string): Promise<string> {
    console.log(`[Primary Provider] Attempting OpenAI request`);
    throw { status: 429, message: `Rate limit exceed` };  // 429 = retryable, so backoff will kick in
}

// FALLBACK provider — a SECOND, independent provider we switch to when primary is exhausted.
async function callFallbackProvider(prompt: string, maxAttempts: number, baseDelay: number): Promise<string> {
    console.log(`[Fallback Provider B] Executing request...`)
    await new Promise((resolve) => setTimeout(resolve, 100))  // pretend it takes a moment
    return `[Provider B Response] Answer for prompt:"${prompt}"`
}

async function runDemo() {
    const userPrompt = 'Explain quantum computing simply.'
    console.log('==== starting demo ====')

    try {
        // Layer 1 — RETRY: keep trying the same provider with backoff.
        const response = await retryWithBackoff(() => callPrimaryProvider(userPrompt), 5, 1000)
        console.log('Success from Primary:', response)
    } catch (primaryError) {
        // Layer 2 — FALLBACK: retries exhausted, switch to a different provider entirely.
        console.log(`primary provider exhausted all retries`);
        console.log(`falling back to provider B`)
        const fallbackResponse = await callFallbackProvider(userPrompt, 4, 1000)
        console.log(`final success`)
        console.log(fallbackResponse)
    }
}

runDemo();