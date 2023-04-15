export type DBTable = {
  name: string;
  fields: DBField[];
};

export type DBField = {
  name: string;
  format: string;
  type: string;
  default: string;
  required: boolean;
};

export type QueryResponse = {
  results: any[];
  type: string;
};

export type QueryHistory = {
  id: number;
  user_id: string;
  generated_prompt: string;
  text_input: string;
  prompt_response: string;
  response: QueryResponse;
  tables: DBTable[];
  created_at: string;
};

export type MinimalHistory = Pick<
  QueryHistory,
  "created_at" | "id" | "prompt_response" | "response" | "text_input"
>;

export const getMinimalHistory = (
  history?: QueryHistory
): MinimalHistory | undefined => {
  if (!history) {
    return;
  }
  const { id, text_input, prompt_response, response, created_at } = history;
  return {
    id,
    text_input,
    prompt_response,
    response,
    created_at,
  };
};
