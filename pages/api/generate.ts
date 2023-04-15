import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { DBTable, getMinimalHistory } from "../../utils/types";
import { Configuration, OpenAIApi } from "openai";
import {
  createFunction,
  getHistoryFromUser,
  saveHistory,
} from "../../utils/supabase-admin";
import { getSupabaseInstanceFromConfig } from "../../utils/helpers";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerSupabaseClient({
    req,
    res,
  });

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { tables, queryInput, config } = req.body;

  if (!tables || tables.length === 0) {
    return res.status(400).json({ error: "Tables are required" });
  }

  const histories = await getHistoryFromUser(session.user.id);
  if (histories.length > 10) {
    return res.status(400).json({ error: "You have reached the limit" });
  }

  const prompt = generatePrompt(tables, queryInput);

  try {
    const sqlFunction = await callOpenAI(prompt);

    // Clear the function sql logic to keep the sql only
    const sql = sqlFunction
      .split("$$")[1]
      .replace("\nBEGIN\n    RETURN QUERY\n", "");

    const history = await saveHistory(
      session.user.id,
      prompt,
      queryInput,
      sql,
      JSON.stringify(tables)
    );

    if (history) {
      const supabaseCustomClient = getSupabaseInstanceFromConfig(config);
      await createFunction(sqlFunction, history.id, supabaseCustomClient);
    }

    return res.status(200).json({ data: getMinimalHistory(history) });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ error: "Failed to generate SQL" });
  }
}

async function callOpenAI(prompt: string): Promise<any> {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are Postgres & Supabase expert. Translate given natural language query into SQL without changing the case of the entries given and output it inside a sql function so it can be called directly. Name it MY_FUNCTION.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stop: ["#", ";"],
  });

  console.log(JSON.stringify(response.data));
  return (response.data.choices[0].message as any).content;
}

function generatePrompt(tables: DBTable[], question: string) {
  let tablesWithFieldsString = "";

  for (const t of tables) {
    tablesWithFieldsString += `\n#${t.name}(${t.fields
      .map((f) => f.name)
      .join(", ")})`;
  }

  const prompt = `
    ### Postgres SQL tables, with their properties:
    #
    ${tablesWithFieldsString}
    #
    ### ${question}
    SELECT
  `;

  return prompt;
}
