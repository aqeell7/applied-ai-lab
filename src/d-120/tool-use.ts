import OpenAI from "openai";
import "dotenv/config";
import { getCityWeather } from "./dummy-data.js";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const question = process.argv.slice(2).join(" ");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const messages: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "you are helpful assitant, use appropritate tools if the question requires it",
  },
  {
    role: "user",
    content: question,
  },
];

async function toolcalling() {
  try {
    const completions = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: messages,
      tools: tools,
      tool_choice: "required",
    });

    const message = completions.choices[0].message;
    if (!message.tool_calls) {
      return console.log(message.content);
    } else {
      const toolCall = message.tool_calls[0];

      console.log(
        "RAW tool_calls:",
        JSON.stringify(message.tool_calls, null, 2),
      );

      if (toolCall.type !== "function")
        return console.log("not a function call");

      let argument = toolCall.function.arguments;
      const parsedArgs = argParsing(argument);

      console.log("Running:", toolCall.function.name, "with", parsedArgs);

      const toolResult = runTool(toolCall.function.name, parsedArgs);

      messages.push(message);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      });

      const res = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: messages,
        tools: tools,
      });

      console.log(res.choices[0].message.content);
    }
  } catch (error) {
    console.log(`api error ${error}`);
  }
}

function argParsing(argument: string) {
  try {
    const parsed = JSON.parse(argument);
    return parsed;
  } catch (err) {
    console.error(`Couldn't parse tool arguments for "${argument}":`, argument);
    return;
  }
}

function runTool(toolName: string, argument: Record<string, any>): string {
  let toolResult = "";
  switch (toolName) {
    case "getWeather":
      toolResult = getCityWeather(argument.city);
      break;
    default:
      console.error(`Unknown tool requested: ${toolName}`);
      toolResult = JSON.stringify({ error: `Tool ${toolName} not found.` });
      break;
  }
  return toolResult;
}

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getWeather",
      description: "Get current weather for a city",
      parameters: {
        type: "object",
        properties: { city: { type: "string" } },
        required: ["city"],
      },
    },
  },
];

toolcalling();


/*
const toolCall = message.tool_calls[0];
// {
//   id: "call_abc123",           // unique ID for this tool call
//   type: "function",            // always "function"
//   function: {
//     name: "get_current_weather",       // which function to call
//     arguments: '{"location":"Boston"}' // JSON string of the args
//   }
// }   

*/