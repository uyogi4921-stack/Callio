import { NextRequest } from "next/server";

/** Escape special XML characters so task titles don't break TwiML */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * GET /api/reminder-call/twiml
 * Returns TwiML that Twilio reads out when the call connects.
 */
export async function GET(request: NextRequest) {
  const rawTask = request.nextUrl.searchParams.get("task") || "your upcoming task";
  const rawTime = request.nextUrl.searchParams.get("time") || "";

  const task = escapeXml(rawTask);
  const timePhrase = rawTime ? ` at ${escapeXml(rawTime)}` : " soon";

  // Must use production domain — VERCEL_URL is behind deployment protection
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://callio-iota.vercel.app";

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="1"/>
  <Say voice="Polly.Joanna" language="en-US">Hey! This is Callio, your accountability partner.</Say>
  <Pause length="0.5"/>
  <Say voice="Polly.Joanna" language="en-US">Just a quick reminder. You have ${task} coming up${timePhrase}.</Say>
  <Pause length="0.5"/>
  <Say voice="Polly.Joanna" language="en-US">Stay on track! You have got this.</Say>
  <Pause length="0.3"/>
  <Say voice="Polly.Joanna" language="en-US">Press 1 to mark it as done, or just hang up and get to it.</Say>
  <Gather numDigits="1" action="${baseUrl}/api/reminder-call/action" method="POST" timeout="5">
    <Pause length="5"/>
  </Gather>
  <Say voice="Polly.Joanna" language="en-US">Alright, go crush it! Goodbye.</Say>
</Response>`;

  return new Response(twiml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
