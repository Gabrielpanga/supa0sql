import { createClient } from "@supabase/supabase-js";
import { QueryHistory } from "./types";

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin priviliges and overwrites RLS policies!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Save the history of the query
export async function saveHistory(
  userId: string,
  prompt: string,
  textInput: string,
  sql: string,
  tableSchema: any
) {
  const { data, error } = await supabaseAdmin
    .from("queries_history")
    .insert({
      user_id: userId,
      generated_prompt: prompt,
      text_input: textInput,
      prompt_response: sql,
      tables: tableSchema,
    })
    .select("*");

  if (error) {
    console.log({ error });
    return;
  }
  return (data as QueryHistory[])[0];
}

// Update the history with the parameters sent
export async function updateHistory(
  historyId: number,
  parameters: Partial<QueryHistory>
): Promise<QueryHistory | undefined> {
  const { data, error } = await supabaseAdmin
    .from("queries_history")
    .update(parameters)
    .eq("id", historyId)
    .select("*");

  if (error) {
    console.log({ error });
    return;
  }

  return (data as QueryHistory[])[0];
}

// Get the history of the query
export async function getHistoryFromUser(
  userId: string
): Promise<QueryHistory[]> {
  const { data, error } = await supabaseAdmin
    .from("queries_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log({ error });
    return [];
  }

  return data as QueryHistory[];
}

export async function getHistoryById(historyId: number) {
  const { data, error } = await supabaseAdmin
    .from("queries_history")
    .select("*")
    .eq("id", historyId);

  if (error) {
    console.log({ error });
    return;
  }

  return (data as QueryHistory[])[0];
}

export async function createFunction(
  sqlFunctionQuery: string,
  history_id: number
): Promise<string | undefined> {
  const functionName = `exec_query_${history_id}`;

  let finalQuery = sqlFunctionQuery
    .replace("MY_FUNCTION", functionName)
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(" BEGIN ", "")
    .replace("RETURN QUERY", "");
  finalQuery = `${finalQuery}; $$ LANGUAGE SQL;`;

  const { error } = await supabaseAdmin.rpc(
    "execute_api_query",
    {
      query: finalQuery,
    },
    {}
  );

  if (error) {
    console.log({ error });
    return;
  }

  return functionName;
}

export async function callFunction(historyId: string) {
  const { data, error } = await supabaseAdmin.rpc(`exec_query_${historyId}`);

  if (error) {
    console.log({ error });
    return [];
  }

  return data as any;
}
