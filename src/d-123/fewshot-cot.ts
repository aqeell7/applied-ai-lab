import OpenAI from "openai";
import "dotenv/config"
import { testcases } from "./testcases.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai = new OpenAI({
    apiKey : OPENAI_API_KEY
})

async function askModel (systemPrompt:string, userInput: string){
    try{
        const completion = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages:[{
                role: "system",
                content:systemPrompt
            },
            {
                role:"user",
                content:userInput
            }]
        })

       return completion.choices[0]?.message?.content || ""
    }catch(error){
        console.error(`api error ${error}`)
        return ""
    }
}

async function runStyle(styleName: string, systemPrompt: string) {
  const row: number[] = []

  for (const testcase of testcases) {
    const answer = await askModel(systemPrompt, testcase.input)
    const clean = extractLabel(answer)          // see Fix 3
    const correct = clean === testcase.correct ? 1 : 0
    row.push(correct)
  }

  const total = row.reduce((a, b) => a + b, 0)
  console.log(`${styleName}: ${row.join(" ")}  =  ${total}/${testcases.length}`)
  return row
}

function extractLabel(answer:string):string{
    const clean = answer.trim().toLowerCase()
    if(clean.includes("billing")) return "billing"
    if(clean.includes("technical")) return "technical"
    if(clean.includes("other")) return "other"
    return clean
}

const zeroShot = "You are a support ticket classifier. Reply with only one label: billing, technical, or other. Nothing else."

const threeShot = `You are a support ticket classifier. Reply with only one label: billing, technical, or other.
Examples:
"I was double charged on my card" -> billing
"The upload button does nothing" -> technical
"How do I close my account?" -> other`

const cot = "You are a support ticket classifier. Think step by step about what the user really wants, then on the last line write only the label: billing, technical, or other."

async function runEvaluation(){
    await runStyle("zero-shot", zeroShot)
    await runStyle("threeShot", threeShot)
    await runStyle("CoT      ", cot)
}

runEvaluation();