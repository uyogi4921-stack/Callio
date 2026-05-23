import { NextRequest } from "next/server";

/**
 * GET /api/reminder-call/twiml
 * Returns TwiML that Twilio reads out when the call connects.
 * This is the voice the user hears.
 */
export async function GET(request: NextRequest) {
  const task = request.nextUrl.searchParams.get("task") || "your upcoming task";
  const time = request.nextUrl.searchParams.get("time") || "";

  const timePhrase = time ? ` at ${time}` : " soon";

  // TwiML — Twilio's XML format for voice instructions
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="1"/>
  <Say voice="Polly.Joanna" language="en-US">
    Hey! This is Callio, your accountability partner.
  </Say>
  <Pause length="0.5"/>
  <Say voice="Polly.Joanna" language="en-US">
    Just a quick reminder — you have "${task}" coming up${timePhrase}.
  </Say>
  <Pause length="0.5"/>
  <Say voice="Polly.Joanna" language="en-US">
    Stay on track! You've got this.
  </Say>
  <Pause length="0.3"/>
  <Say voice="Polly.Joanna" language="en-US">
    Press 1 to mark it as done, or just hang up and get to it.
  </Say>
  <Gather numDigits="1" action="/api/reminder-call/action" method="POST" timeout="5">
    <Pause length="5"/>
  </Gather>
  <Say voice="Polly.Joanna" language="en-US">
    Alright, go crush it! Goodbye.
  </Say>
</Response>`;

  return new Response(twiml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
