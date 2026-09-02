import OpenAI from "openai";
import 'dotenv/config'
import { getEncoding } from "js-tiktoken";
import { API_RATES, type ModelName } from "./prices.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const question = process.argv.slice(2).join(" ");

async function main(){ 
    try{
      function countTokens(question:string, model: ModelName){

       const enc = getEncoding("o200k_base");

       const tokens = enc.encode(question);
       const tokenCount = tokens.length;

       const rates = API_RATES[model]

       const inputCost = (tokenCount/ 1000000 )* rates.inputPrice
       const cacheCost = (tokenCount/ 1000000 )* rates.cacheInputPrice
       const outputCost = (tokenCount/ 1000000 )* rates.outputPrice

       console.log(`Token count: ${tokenCount}`)
       console.log(`Input cost: ${inputCost.toFixed(6)}`)
       console.log(`Cache input cost: ${cacheCost.toFixed(6)}`)
       console.log(`Output cost: ${outputCost.toFixed(6)}`)
      } 

      countTokens(question, "gpt-5-nano")
        
    }catch(error){
        console.error("Error calculating tokens:", error)
    }
}

main()

// try{ 
//     if(!OPENAI_API_KEY){
//         return console.log("api key is missing here")
//     }

//     if(!question){
//         return console.log("enter your question after npx tsx src/cost-estimator.ts ")
//     }
//     const completion = await openai.chat.completions.create({
//     messages:[{
//         role:"system",
//         content: "you are a helpful assistant and you answer in simple terms",  
//     },
//     {
//         role:"user",
//         content: question
//     }
// ],
//     model:"gpt-5-nano"
// })

// console.log(completion.choices[0].message.content)
//    }catch(error){
//         console.log(`api error ${error}`)
//    } 