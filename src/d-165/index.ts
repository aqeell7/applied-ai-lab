import "dotenv/config"

const question = process.argv.slice(2).join(" ")
console.log(question)
async function cli(){
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
    if(!GEMINI_API_KEY){
        return console.log("there is not api key or unable to fetch key")
    } 

    if(!question){
      return console.log("you forgot to enter your question, please enter your question after npx tsx src/index.ts")
    }

    try{
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",{
        method: "POST",
        headers: { "Authorization":`Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json"},
        body: JSON.stringify({
            model: "gemini-2.5-flash",
            temperature:0.5,
            max_tokens:2000,
            messages:[
                {
                    role:"user",
                    content: question
                }
            ]
        })
    })

    if (!res.ok){
        const errorData = await res.json();
        throw new Error(`API Error ${res.status}:${JSON.stringify(errorData)}`)
    }
     const data = await res.json();
        console.log(data.choices[0].message.content)
        console.log(`the total token consumed are, ${data.usage.total_tokens}`)
        const totalcost = (data.usage.prompt_tokens/1000000)*0.30 + (data.usage.completion_tokens/1000000)*2.50
        console.log(`the paid tier input price for text is $0.30 and output token price is $2.50`)
        console.log(`the total cost for the input and output tokens are $${totalcost}`)
    }catch(error){
        console.log(error)
    }
    //  console.log(data, null, 2)  
}
cli() 
