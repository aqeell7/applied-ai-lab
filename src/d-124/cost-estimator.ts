import { getEncoding } from "js-tiktoken";
import { API_RATES, type ModelName } from "./prices.js";
import { costEstimateParams } from "./prices.js";

export function countTokens(text: string, model:ModelName){

    if(!text || text.trim()=== ""){
        return 0;
    }

    if(!(model in API_RATES)){
        throw new Error(`Unknown model: "${model}"`)
    }

    const enc = getEncoding("o200k_base");
    const tokens = enc.encode(text);

    return tokens.length;
}

export function estimateCost(params: costEstimateParams){
    let totalInputTokens: number;

    if("text" in params){
        totalInputTokens = countTokens(params.text, params.model)
    }else{
        totalInputTokens = params.inputTokens;
    }

    const rates = API_RATES[params.model]

    if(!rates){
        throw new Error(`Unknown model:"${params.model}"`)
    }

    const cachedTokens = params.cachedTokens ?? 0;
    const regularTokens = Math.max(0, totalInputTokens - cachedTokens)

    const regularInputCost = (regularTokens/1000000)*rates.inputPrice;
    const cachedInputCost = (cachedTokens/1000000)*rates.cacheInputPrice;
    const outputCost = (params.outputTokens/1000000)*rates.outputPrice

    const inputCost = regularInputCost + cachedInputCost;

    const totalCost = inputCost + outputCost;

    return {
        inputCost: inputCost,
        outputCost: outputCost,
        totalCost: totalCost
    }
}


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