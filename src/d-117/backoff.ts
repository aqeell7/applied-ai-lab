import { resolve } from "node:dns";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve)=>{
        setTimeout(resolve,ms)
    })
}

function isRetryableError(error: any): boolean {
  // Extract HTTP status code if present (e.g., Axios, Fetch, or custom error objects)
  const status = error?.status || error?.response?.status;

  if (typeof status === "number") {
    // 429 Too Many Requests -> RETRY
    if (status === 429) return true;

    // 5xx Server Errors (500, 502, 503, etc.) -> RETRY
    if (status >= 500 && status <= 599) return true;

    // 4xx Client Errors (400, 401, 403, 404) -> DO NOT RETRY
    if (status >= 400 && status < 500) return false;
  }

  // Handle standard network timeouts or dropped connection codes
  if (error?.code === "ECONNABORTED" || error?.name === "TimeoutError") {
    return true;
  }

  // Default fallback: if we don't recognize the exact error structure, retry it
  return true;
}


async function retryWithBackoff<T>(fn: ()=> Promise<T>,):Promise<T>{
    const maxAttempts:number = 3
    const baseDelay:number = 1000

    for(let attempt = 1; attempt<=maxAttempts; attempt++){
        try{
            console.log(`Attempts ${attempt} of ${maxAttempts}`)

            return await fn();
        }catch(error){
            console.log(`Attempt ${attempt} failed`)

            if(attempt === maxAttempts){
                throw error;
            }

            const delay = baseDelay * Math.pow(2, attempt-1)

            const jitterDelay = Math.floor(Math.random() * delay);
            
            console.log(`waiting ${delay}ms before retrying...`)
            await sleep(jitterDelay)
        }
       
    }
        throw new Error ("Unexpected end of retry loop")
}

  
let calls = 0;

async function flakyTask(): Promise<string>{
    calls++
    if(calls < 3){
        throw new Error("Network glitch");
    }
    return "Success on try 3"
}

const result = await retryWithBackoff(flakyTask)
console.log(result)