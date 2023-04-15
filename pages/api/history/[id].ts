import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import { getHistoryById, updateHistory } from "../../../utils/supabase-admin";
import { getMinimalHistory } from "../../../utils/types";

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

  const { id } = req.query as { id: string };

  if (!id) {
    return res.status(400).json({ error: "history_id is required" });
  }

  const history = await getHistoryById(parseInt(id));

  if (!history) {
    return res.status(400).json({ error: "history not found" });
  }

  if (history.user_id !== session.user.id) {
    return res.status(401).json({ error: "Not authorized" });
  }

  if (req.method === "GET") {
    return res.status(200).json({ data: getMinimalHistory(history) });
  }

  if (req.method === "PATCH") {
    const updatedHistory = await updateHistory(history.id, req.body);
    return res.status(200).json({ data: getMinimalHistory(updatedHistory) });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
