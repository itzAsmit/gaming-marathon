import { sendAuthError, verifyAdminRequest } from "./_adminAuth";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user } = await verifyAdminRequest(req);
    return res.status(200).json({ ok: true, user });
  } catch (error) {
    return sendAuthError(res, error);
  }
}
