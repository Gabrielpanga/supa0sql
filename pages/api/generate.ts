import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { DBTable } from "../../utils/types";
import { Configuration, OpenAIApi } from "openai";
import { saveHistory } from "../../utils/supabase-admin";

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

  const { tables, queryInput } = req.body;

  const prompt = generatePrompt(tables, queryInput);

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are Postgres & Supabase expert. Translate given natural language query into SQL without changing the case of the entries given.",
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
    const message = response.data.choices[0].message as any;

    const sql = `SELECT ${message.content};`;

    await saveHistory(
      session.user.id,
      prompt,
      queryInput,
      sql,
      JSON.stringify(tables)
    );
    return res.status(200).json({ result: sql });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ error: "Failed to generate SQL" });
  }
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
