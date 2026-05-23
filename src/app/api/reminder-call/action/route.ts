import { NextRequest } from "next/server";

/**
 * POST /api/reminder-call/action
 * Handles DTMF input (keypress) during a reminder call.
 * Press 1 = mark task done.
 */
export async function POST(request: NextRequest) {
  let digits = "";

  try {
    const formData = await request.formData();
    digits = formData.get("Digits")?.toString() || "";
  } catch {
    // If formData parsing fails, try URL-encoded body
    try {
      const text = await request.text();
      const params = new URLSearchParams(text);
      digits = params.get("Digits") || "";
    } catch {
      digits = "";
    }
  }

  let message: string;

  if (digits === "1") {
    message = "Great job! I have noted that as done. Keep up the momentum! Goodbye.";
  } else {
    message = "Got it. Good luck with your task! Goodbye.";
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">${message}</Say>
</Response>`;

  return new Response(twiml, {
    headers: { "Content-Type": "application/xml" },
  });
}
