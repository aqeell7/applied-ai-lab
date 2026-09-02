import { estimateCost, countTokens } from "./cost-estimator.js";
import { API_RATES, ModelName } from "./prices.js";

const text = "The history of computing is a story of relentless miniaturization. What began as room-sized machines in the 1940s has evolved into devices that fit comfortably in our pockets. Each generation brought faster processors, denser memory, and smaller transistors. Today, billions of these tiny switches operate in parallel to process the information we send with a simple tap. The pace has only accelerated, reshaping industries and the very fabric of daily life in ways earlier generations could scarcely have imagined."

const tokenCount = countTokens(text, "gpt-5-nano")

const ASSUMED_OUTPUT_TOKENS = 500;

const models = Object.keys(API_RATES) as ModelName[];

const tableData = models.map((model)=>{
    const costs = estimateCost({
        model: model,
        inputTokens: tokenCount,
        outputTokens: ASSUMED_OUTPUT_TOKENS
    })

    return {
        "Model":model,
         "Input Cost": `$${costs.inputCost.toFixed(6)}`,
         "Output Cost":`$${costs.outputCost.toFixed(6)}`,
         "Total Cost": `$${costs.totalCost.toFixed(6)}`

    }
})

console.table(tableData)

const solCosts = estimateCost({
    model:"gpt-5.6-sol",
    inputTokens: tokenCount,
    outputTokens: ASSUMED_OUTPUT_TOKENS  
})

const nanoCosts = estimateCost({
    model:"gpt-5-nano",
    inputTokens: tokenCount,
    outputTokens: ASSUMED_OUTPUT_TOKENS
})

const ratio = solCosts.totalCost/nanoCosts.totalCost;

console.log(`\nFrontier vs cheap Ratio (Sol % Nano): ${ratio.toFixed(2)}x`)
console.log(`Running "gpt-5.6-sol" is ${Math.round(ratio)} times more expensive than "gpt-5-nano" for this prompt`)