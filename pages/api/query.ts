import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import { callFunction, getHistoryById } from "../../utils/supabase-admin";

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

  const { history_id } = req.query as { history_id: string };

  if (!history_id) {
    return res.status(400).json({ error: "history_id is required" });
  }

  const history = await getHistoryById(parseInt(history_id));

  if (!history) {
    return res.status(400).json({ error: "history not found" });
  }

  if (history.user_id !== session.user.id) {
    return res.status(401).json({ error: "Not authorized" });
  }

  const data = await callFunction(history_id);
  return res.status(200).json({ data });
}
