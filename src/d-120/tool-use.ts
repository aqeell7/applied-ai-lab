import OpenAI from "openai";
import "dotenv/config";
import { getCityWeather } from "./dummy-data.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const question = process.argv.slice(2).join(" ")

const openai = new OpenAI({
    apiKey:OPENAI_API_KEY
})

async function toolcalling(){
    try{
        const completions = await openai.chat.completions.create({
            model:"gpt-5-nano",
            messages:[
                {
                    role:"system",
                    content:"you are helpful assitant, use appropritate tools if the question requires it"
                },
                {
                    role:"user",
                    content:question
                },
            ],
            tools:tools
        })

        const message = completions.choices[0].message
        if(!message.tool_calls){
            return console.log(message.content)
        }else{
            const toolCall = message.tool_calls[0]
            const argument = JSON.parse(toolCall.function.arguments)
            const toolResult = getCityWeather(argument.city)
            
        }
    }catch(error){
        console.log(`api error ${error}`)
    }
}

const tools = [{
    type:"function",
    function: {
        name:"getWeather",
        description:"Get current weather for a city",
        parameters: {
            type:"object",
            properties: { city: {type:"string"}},
            required:["city"]
        }
    }
}]

