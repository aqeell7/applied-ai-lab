import OpenAI from "openai";
import "dotenv/config";
import {
  getCountryCapital,
  getCityPopulation,
  getPopulationDensity,
} from "./dummy-data.js";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";
import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const question = process.argv.slice(2).join(" ");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// The running conversation. We keep pushing to it every turn so the model
// always sees the full story: user question -> its own tool requests ->
// tool results -> next request -> ... -> final answer.
const messages: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "you are a helpful assistant, use appropriate tools if the question requires it",
  },
  { role: "user", content: question },
];

// Zod schemas — the runtime guard that the args the model produced actually
// match the shape each tool expects (JSON Schema below only *hints* the model;
// it does not enforce anything at runtime).
const countrySchema = z.object({
  country: z.string(),
});

const citySchema = z.object({
  city: z.string(),
});

const populationSchema = z.object({
  population: z.number(),
});

// THE AGENT LOOP.
// Each turn is one full round-trip with the model: send the conversation ->
// the model either asks for a tool or gives a final answer. If it asks for a
// tool, we run it, append the result, and loop again so the model can use that
// result to decide its next step. This is what lets it chain DEPENDENT steps
// (e.g. it can't ask for a city's population until a previous tool told it the
// city name).
async function toolcalling() {
  // The iteration cap. The loop's natural exit is "the model stopped asking
  // for tools" — but we can't predict when that happens, and a confused model
  // could ask forever. maxTurns is the backstop: it bounds cost (each turn is
  // a paid API call) and, in real systems, the blast radius of tools that take
  // real actions.
  const maxTurns = 5;

  try {
    for (let turns = 0; turns < maxTurns; turns++) {
      // Send the whole conversation so far. tool_choice:"auto" lets the model
      // decide whether it needs a tool this turn at all.
      const completions = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: messages,
        tools: tools,
        tool_choice: "auto",
      });

      const message = completions.choices[0].message;

      console.log("RAW tool_calls:", JSON.stringify(message.tool_calls, null, 2));

      // NATURAL EXIT (success): no tool_calls means the model is done and gave
      // us final prose. Print it and return out of the whole function.
      if (!message.tool_calls) {
        return console.log(message.content);
      }

      // Push the model's OWN reply (the message carrying the tool requests)
      // FIRST, before any results. The tool results below are the *answers*;
      // this is the *request* they answer. Skip it and the history is broken —
      // the model would see answers with no matching question.
      messages.push(message as ChatCompletionMessageParam);

      // Work through EVERY tool the model asked for this turn — 1, 2, or many,
      // all the same path. (A single turn can legitimately batch independent
      // calls; dependent ones arrive one per turn.)
      for (const toolCall of message.tool_calls) {
        // A call can be a "function" kind or a newer "custom" kind. Skip
        // non-functions — this also narrows the type so toolCall.function is
        // safe to read below.
        if (toolCall.type !== "function") continue;

        // The model sends args as a JSON STRING — turn it into a real object.
        const parsedArgs = argParsing(toolCall.function.arguments);

        console.log("Running:", toolCall.function.name, "with", parsedArgs);

        // Validate the args against the matching Zod schema before running.
        const check = validateArgs(toolCall.function.name, parsedArgs);

        let toolResult: string;

        // Good args -> run the tool. Bad args -> send an error result back to
        // the model instead of crashing (the model can then correct itself).
        if (check.ok) {
          toolResult = runTool(toolCall.function.name, check.data);
        } else {
          toolResult = JSON.stringify({ error: check.error });
        }

        // Push ONE result per call, tagged with THIS call's id so the model
        // knows which answer belongs to which request.
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      }
      // loop back around: the model now sees the new results and decides again.
    }

    // CAP EXIT (failure): we fell out of the loop, meaning we hit maxTurns and
    // the model NEVER stopped asking for tools. This is NOT a success, so we do
    // not return a half-baked last message — we throw. It sits OUTSIDE the
    // try/catch so it surfaces as a clear "hit max turns", not disguised as an
    // API error.
  } catch (error) {
    console.log(`api error ${error}`);
  }
  throw new Error("the model hit max turns here");
}

// WORKER: raw JSON string -> real object. Returns undefined on a bad parse;
// validateArgs downstream catches the resulting shape mismatch.
function argParsing(argument: string) {
  try {
    const parsed = JSON.parse(argument);
    return parsed;
  } catch (err) {
    console.error(`Couldn't parse tool arguments for "${argument}":`, argument);
    return;
  }
}

// WORKER: given a tool name + validated args, run the matching function and
// return its result as a string. Case labels MUST match the tool names exactly.
// A throw from any tool is caught and returned as an error result string, so a
// missing-data throw can't crash the loop.
function runTool(toolName: string, argument: Record<string, any>): string {
  let toolResult: string;
  try {
    switch (toolName) {
      case "getCountryCapital":
        toolResult = getCountryCapital(argument.country);
        break;
      case "getCityPopulation":
        toolResult = getCityPopulation(argument.city).toString();
        break;
      case "getPopulationDensity":
        toolResult = getPopulationDensity(argument.population);
        break;
      default:
        console.error(`Unknown tool requested: ${toolName}`);
        toolResult = JSON.stringify({ error: `Tool ${toolName} not found.` });
        break;
    }
  } catch (err: any) {
    toolResult = JSON.stringify({ error: err.message });
  }
  return toolResult;
}

// WORKER: pick the schema by tool name and safeParse the args. Returns a
// discriminated union — {ok:true,data} on success, {ok:false,error} on failure
// — so the caller handles both cases without try/catch. The default case closes
// the "unknown tool" hole.
function validateArgs(
  toolName: string,
  parsedArgs: Record<string, any>
): { ok: true; data: Record<string, any> } | { ok: false; error: string } {
  let result;

  switch (toolName) {
    case "getCountryCapital":
      result = countrySchema.safeParse(parsedArgs);
      break;

    case "getCityPopulation":
      result = citySchema.safeParse(parsedArgs);
      break;

    case "getPopulationDensity":
      result = populationSchema.safeParse(parsedArgs);
      break;

    default:
      return { ok: false, error: `Unknown tool:${toolName}` };
  }

  if (result.success) {
    return { ok: true, data: result.data };
  } else {
    return { ok: false, error: result.error.message };
  }
}

// The 3 tools the model can pick from. "parameters" is JSON Schema — its types
// are STRING literals ("string"/"number"), NOT Zod values. It tells the MODEL
// what shape of args to produce; it does NOT validate what actually comes back
// (that's validateArgs' job).
const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getCountryCapital",
      description: "Get the capital city of a country",
      parameters: {
        type: "object",
        properties: { country: { type: "string" } },
        required: ["country"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCityPopulation",
      description: "Get the population of a given city",
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
      name: "getPopulationDensity",
      description: "Get the population density rating based on population number",
      parameters: {
        type: "object",
        properties: {
          population: { type: "number" },
        },
        required: ["population"],
      },
    },
  },
];

toolcalling();