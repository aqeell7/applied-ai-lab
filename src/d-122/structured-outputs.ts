import OpenAI from "openai";
import "dotenv/config"
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { inputString } from "./input-strings.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai =  new OpenAI({
    apiKey : OPENAI_API_KEY
})

const outputSchema = z.object({
    category: z.string(),
    entities: z.array(z.string()),
    sentiment:z.enum(["positive", "negative", "neutral"])
})

async function main(input:string){
    try{
        const completion = await openai.chat.completions.create({
            model:"gpt-5-nano",
            messages:[{
                role:"system",
                content:"analyze the input and classify the text into the shape into that shape. Always reply in plain English prose. Never use JSON."
            },{
                role:"user",
                content:input
            }
        ],
        response_format:zodResponseFormat(outputSchema, "outputSchema")
        })

        return completion.choices[0].message.content

    }catch(error){
        console.error(`api error ${error}`)
    }
}

async function parser(){
    for (const input of inputString){ 
       const first = await attempt(input)
       if(first !== null){
            console.log("success",first) 
       }else{
        const second = await attempt(input)
        if(second !== null){
            console.log("success",second)
        }else{
            console.log(`this input has been failed twice here --- ${input}`)
        }
       }
        
    }
    return;
}

parser()

async function attempt(input:string){
    const output:any = await main(input)
    try{
        const clean = JSON.parse(output)
        const result = outputSchema.safeParse(clean)
        if(result.success) return result.data;
        return null;
    }catch{
        return null
    }
}