import { NextRequest } from "next/server";

/**
 * POST /api/reminder-call
 * Triggers an outbound Twilio call to remind the user about a task.
 * Uses inline TwiML with basic voice (no Polly dependency).
 */
export async function POST(request: NextRequest) {
  const { phone, taskTitle, taskTime } = await request.json();

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

  // Clean task title: strip any XML-unsafe chars
  const cleanTitle = taskTitle.replace(/[<>&"']/g, "");
  const cleanTime = taskTime ? taskTime.replace(/[<>&"']/g, "") : "";
  const timePhrase = cleanTime ? ` at ${cleanTime}` : " soon";

  // Absolute minimal TwiML — no voice attribute, no special chars
  const twiml = [
    "<Response>",
    `<Say>Hey! This is Callio, your accountability partner.</Say>`,
    `<Say>Just a quick reminder. You have ${cleanTitle} coming up${timePhrase}.</Say>`,
    `<Say>Stay on track! You got this. Goodbye!</Say>`,
    "</Response>",
  ].join("");

  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString(
      "base64"
    );

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

    const callData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[Reminder Call] Twilio error:", JSON.stringify(callData));
      return Response.json(
        {
          error: callData.message || "Failed to initiate call",
          code: callData.code,
          twilioStatus: response.status,
        },
        { status: response.status }
      );
    }

    return Response.json({
      success: true,
      callSid: callData.sid,
      status: callData.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Reminder Call] Error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
