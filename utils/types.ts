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

export type QueryHistory = {
  id: number;
  user_id: string;
  generated_prompt: string;
  text_input: string;
  prompt_response: string;
  tables: DBTable[];
  created_at: string;
};
