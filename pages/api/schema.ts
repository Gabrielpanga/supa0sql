import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const { IGNORE_TABLES = "" } = process.env;

async function getTableDefinitions(supabaseUrl?: string, anonKey?: string) {
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
  const { url, anon } = req.body;
  const tables = await getTableDefinitions(url, anon);
  return res.status(200).json({ tables });
}
