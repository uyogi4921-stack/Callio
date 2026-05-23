import { NextRequest } from "next/server";

/** Escape special XML characters */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * POST /api/reminder-call
 * Triggers an outbound Twilio call to remind the user about a task.
 * Uses inline TwiML with basic Twilio voice (no Polly dependency).
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

  const task = escapeXml(taskTitle);
  const timePhrase = taskTime ? ` at ${escapeXml(taskTime)}` : " soon";

  // Simple inline TwiML with built-in Twilio voice (alice)
  const twiml = `<Response><Say voice="alice">Hey! This is Callio, your accountability partner. Just a quick reminder. You have ${task} coming up${timePhrase}. Stay on track! You got this. Goodbye!</Say></Response>`;

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const body = new URLSearchParams({
      To: phone,
      From: twilioPhone,
      Twiml: twiml,
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
