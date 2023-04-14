import { createClient } from "@supabase/supabase-js";
import { QueryHistory } from "./types";

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin priviliges and overwrites RLS policies!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Save the history of the query
async function saveHistory(
  userId: number,
  prompt: string,
  textInput: string,
  sql: string,
  tableSchema: any
) {
  const { error } = await supabaseAdmin.from("query_history").insert({
    user_id: userId,
    generated_prompt: prompt,
    text_input: textInput,
    prompt_response: sql,
    tables: tableSchema,
  });

  if (error) {
    console.log({ error });
    return;
  }
}

// Get the history of the query
export async function getHistoryFromUser(
  userId: string
): Promise<QueryHistory[]> {
  const { data, error } = await supabaseAdmin
    .from("query_history")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.log({ error });
    return [];
  }

  return data as QueryHistory[];
}
