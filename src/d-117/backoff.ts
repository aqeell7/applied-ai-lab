// Pause execution for `ms` milliseconds.
// setTimeout is callback-based; we wrap it in a Promise so we can `await` it.
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

// Decide whether an error is worth retrying.
// Rule: retry TEMPORARY failures (they may fix themselves); never retry PERMANENT ones.
function isRetryableError(error: any): boolean {
  // Different libraries put the status in different places, so check both shapes.
  const status = error?.status || error?.response?.status;

  if (typeof status === "number") {
    if (status === 429) return true;              // rate-limited → back off and retry
    if (status >= 500 && status <= 599) return true; // server hiccup → retry
    if (status >= 400 && status < 500) return false; // our fault (bad key/URL/body) → don't retry
  }

  // Network-level failures (request hung / dropped) → retry.
  if (error?.code === "ECONNABORTED" || error?.name === "TimeoutError") {
    return true;
  }

  // Unknown error shape: retry once rather than fail blindly. (Debatable — see NOTES.)
  return true;
}

// Run `fn`, and if it fails with a retryable error, try again with exponential backoff + jitter.
// Generic <T> = works for ANY async function, whatever it returns.
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number,   // total tries before giving up
    baseDelay: number      // first wait in ms; each retry doubles the ceiling
): Promise<T> {

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Attempts ${attempt} of ${maxAttempts}`)
            return await fn();   // success → hand result straight back, no waiting
        } catch (error) {
            console.log(`Attempt ${attempt} failed`)

            const isRetryable = isRetryableError(error);
            const hasAttemptsLeft = attempt < maxAttempts

            // Bail out immediately if the error can't be fixed by retrying,
            // OR if we've used our last attempt. Either way: throw the real error.
            if (!isRetryable || !hasAttemptsLeft) {
                throw error;
            }

            // Exponential backoff: ceiling grows 1x, 2x, 4x... (baseDelay * 2^(attempt-1)).
            const delay = baseDelay * Math.pow(2, attempt - 1)

            // "Full jitter": pick a random wait between 0 and the ceiling.
            // Spreads out many clients' retries so they don't all hit at once (thundering herd).
            const jitterDelay = Math.floor(Math.random() * delay);

            console.log(`waiting ${jitterDelay}ms before retrying...`)
            await sleep(jitterDelay)
        }
    }

    // Unreachable in practice: the loop either returns on success or throws on the last attempt.
    // Kept so TypeScript sees a guaranteed return/throw on every path.
    throw new Error("Unexpected end of retry loop")
}