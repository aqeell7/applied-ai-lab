import { GoogleGenAI } from "@google/genai";
import "dotenv/config"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const question = process.argv.slice(2).join(" ")

async function main(){

    if(!GEMINI_API_KEY){
        return console.log("api keys are missing here")
    }
    if(!question){
        return console.log("please enter the question after npx tsx src/d-164/google-sdk.ts")
    }
    const ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    })

    try{
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: question
        })

        for await(const chunk of response){
            if(chunk.text){
            process.stdout.write(chunk.text)
            }
        }
    }catch(error){
        if(error instanceof Error){
            console.log("Something went wrong:", error.message)
        }else{
            console.log("unknown error:", error)
        }
    }
}

main();
