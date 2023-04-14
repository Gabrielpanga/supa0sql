import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const { IGNORE_TABLES = "" } = process.env;

async function getTableDefinitions(supabaseUrl?: string, anonKey?: string) {
  if (!supabaseUrl && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing supabase url");
  }

  if (!anonKey && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing supabase anon key");
  }

  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { data } = await axios.get(`${url}/rest/v1/?apikey=${anon}`);

  const tables = [];

  const ignoreTableList = IGNORE_TABLES.split(",");
  const tablesToReview = Object.keys(data.definitions).filter(
    (tableName) => !ignoreTableList.includes(tableName)
  );

  for (const tableName of tablesToReview) {
    const tableDefinition = data.definitions[tableName];
    tables.push({
      name: tableName,
      fields: Object.keys(tableDefinition.properties).map((propertyKey) => {
        const property = tableDefinition.properties[propertyKey];
        return {
          name: propertyKey,
          format: property.format,
          type: property.type,
          default: property.default,
          required: tableDefinition.required.includes(property.name),
        };
      }),
    });
  }

  return tables;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { supabaseUrl, supabaseAnnonKey } = req.body;
  console.log("Reviewing parameters", { supabaseUrl, supabaseAnnonKey });
  try {
    const tables = await getTableDefinitions(supabaseUrl, supabaseAnnonKey);
    return res.status(200).json({ tables });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
