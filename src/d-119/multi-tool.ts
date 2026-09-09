import OpenAI from "openai";
import "dotenv/config";
import { getCityWeather, getCityTime, convertCurrency } from "./dummy-data.js";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const question = process.argv.slice(2).join(" ");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// The running conversation. We keep pushing to it so the model always sees
// the full story: user question -> its own tool requests -> tool results.
const messages: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "you are a helpful assistant, use appropriate tools if the question requires it",
  },
  { role: "user", content: question },
];

async function toolcalling() {
  try {
    // FIRST CALL: ask the model. tool_choice:"auto" lets it decide whether to
    // use tools at all — and it can request SEVERAL in one turn.
    const completions = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
    });

    const message = completions.choices[0].message;

    console.log("RAW tool_calls:", JSON.stringify(message.tool_calls, null, 2));

    // No tools requested -> the model just chatted. Print its prose and stop.
    // This early return also NARROWS the type: past this line TS knows
    // tool_calls is a real array, not undefined.
    if (!message.tool_calls) {
      return console.log(message.content);
    }

    // Push the model's OWN reply (the one holding the tool requests) FIRST,
    // once, before any results. The tool results below are answers; this is
    // the question they answer. Skip it and the history is malformed.
    messages.push(message);

    // Work through EVERY tool the model asked for — 1, 2, or many, same path.
    for (const toolCall of message.tool_calls) {
      // A call can be a "function" kind or a newer "custom" kind. Skip
      // non-functions; this also tells TS that toolCall.function is safe below.
      if (toolCall.type !== "function") continue;

      // The model sends args as a JSON STRING — turn it into a real object.
      const parsedArgs = argParsing(toolCall.function.arguments);

      console.log("Running:", toolCall.function.name, "with", parsedArgs);

      // Run the real function and CATCH what it returns.
      const toolResult = runTool(toolCall.function.name, parsedArgs);

      // Push ONE result per call, tagged with THIS call's id so the model
      // knows which answer belongs to which request.
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResult,
      });
    }

    // SECOND CALL: the history now holds all tool results. The model reads
    // them and writes the final human answer. Happens ONCE, after the loop.
    const res = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: messages,
      tools: tools,
    });

    console.log(res.choices[0].message.content);
  } catch (error) {
    console.log(`api error ${error}`);
  }
}

// WORKER: raw JSON string -> real object. One job. (Note: still returns
// undefined on a bad parse — that's the hole C2/validation will close.)
function argParsing(argument: string) {
  try {
    const parsed = JSON.parse(argument);
    return parsed;
  } catch (err) {
    console.error(`Couldn't parse tool arguments for "${argument}":`, argument);
    return;
  }
}

// WORKER: given a tool name + clean args, run the matching function and
// return its result string. Case labels MUST match the schema names exactly.
function runTool(toolName: string, argument: Record<string, any>): string {
  let toolResult = "";
  switch (toolName) {
    case "getWeather":
      toolResult = getCityWeather(argument.city);
      break;
    case "getCityTime":
      toolResult = getCityTime(argument.city);
      break;
    case "convertCurrency":
      toolResult = convertCurrency(argument.amount, argument.from, argument.to);
      break;
    default:
      console.error(`Unknown tool requested: ${toolName}`);
      toolResult = JSON.stringify({ error: `Tool ${toolName} not found.` });
      break;
  }
  return toolResult;
}

// The 3 tools the model can pick from. "parameters" is JSON Schema — its
// types are STRING literals ("string"/"number"). It tells the MODEL what
// shape of args to produce (it does NOT validate what actually comes back).
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
  {
    type: "function",
    function: {
      name: "getCityTime",
      description: "get time for a city",
      parameters: {
        type: "object",
        properties: { city: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "convertCurrency",
      description: "converts the amount from one currency to another currency",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number" },
          from: { type: "string" },
          to: { type: "string" },
        },
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