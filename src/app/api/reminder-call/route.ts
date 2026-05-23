import { NextRequest } from "next/server";

/**
 * POST /api/reminder-call
 * Triggers an outbound Twilio call to remind the user about a task.
 *
 * Body: { phone: string, taskTitle: string, taskTime: string, taskId: string }
 */
export async function POST(request: NextRequest) {
  const { phone, taskTitle, taskTime, taskId } = await request.json();

  if (!phone || !taskTitle) {
    return Response.json(
      { error: "phone and taskTitle are required" },
      { status: 400 }
    );
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhone) {
    return Response.json(
      { error: "Twilio credentials not configured" },
      { status: 500 }
    );
  }

  // Build the TwiML URL — Twilio will fetch this when the call connects
  const origin =
    request.headers.get("origin") ||
    request.headers.get("x-forwarded-host") ||
    "https://callio-iota.vercel.app";
  const twimlUrl = `${origin.startsWith("http") ? origin : `https://${origin}`}/api/reminder-call/twiml?task=${encodeURIComponent(taskTitle)}&time=${encodeURIComponent(taskTime || "")}&id=${encodeURIComponent(taskId || "")}`;

  try {
    // Use Twilio REST API directly (no need for heavy SDK import in serverless)
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const body = new URLSearchParams({
      To: phone,
      From: twilioPhone,
      Url: twimlUrl,
      Method: "GET",
    });

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("[Reminder Call] Twilio error:", errData);
      return Response.json(
        { error: errData.message || "Failed to initiate call" },
        { status: response.status }
      );
    }

    const callData = await response.json();
    return Response.json({
      success: true,
      callSid: callData.sid,
      status: callData.status,
    });
  } catch (err: any) {
    console.error("[Reminder Call] Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
