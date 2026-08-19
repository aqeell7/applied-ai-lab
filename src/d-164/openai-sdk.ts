import OpenAI from "openai";
import "dotenv/config"

const question = process.argv.slice(2).join(" ")
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

async function main(){

    if(!question){
        return console.log("you forgot to enter your question, please enter your question after npx tsx src/index.ts")
    }
    if(!GEMINI_API_KEY){
        return console.log("there is not api key or unable to fetch key")
    } 

    const openai = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL:"https://generativelanguage.googleapis.com/v1beta/openai/"
    })

    try{
     const completions = await openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages :[{
            role: "system",
            content: "you are a helpful assistant"
        },
        {
            role:"user",
            content: question
        }
    ],
    stream: true
    })

    for await(const chunk of completions){
        const content = chunk.choices[0]?.delta?.content

        if(content){
        process.stdout.write(content)
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