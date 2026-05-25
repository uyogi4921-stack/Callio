import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

/**
 * GET /api/cron/send-reminders
 * Called by Vercel Cron every minute.
 * Finds reminders due within the next 2 minutes that haven't been sent yet,
 * looks up the user's phone, and triggers a Twilio call.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return Response.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  // Use service role for server-side access
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date();
  const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000);

  try {
    // Get unsent reminders that are due within the next 2 minutes
    const { data: reminders, error: remError } = await supabase
      .from("reminders")
      .select("*, tasks(title, due_time, user_id)")
      .eq("sent", false)
      .eq("type", "call")
      .lte("remind_at", twoMinutesFromNow.toISOString())
      .gte("remind_at", new Date(now.getTime() - 5 * 60 * 1000).toISOString());

    if (remError || !reminders || reminders.length === 0) {
      return Response.json({
        ok: true,
        processed: 0,
        message: remError ? remError.message : "No pending reminders",
      });
    }

    const results: Array<{
      reminderId: string;
      status: string;
      callSid?: string;
    }> = [];

    for (const reminder of reminders) {
      const task = (reminder as Record<string, unknown>).tasks as {
        title: string;
        due_time: string;
        user_id: string;
      } | null;

      if (!task) {
        results.push({
          reminderId: reminder.id,
          status: "skipped_no_task",
        });
        continue;
      }

      // Get user's phone number from profile or auth metadata
      let phone: string | null = null;

      // Try profiles table first
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", task.user_id)
        .single();

      if (profile?.phone) {
        phone = profile.phone;
      } else {
        // Fallback: check auth user metadata
        const {
          data: { user },
        } = await supabase.auth.admin.getUserById(task.user_id);
        const metaPhone = user?.user_metadata?.phone as string | undefined;
        if (metaPhone) phone = metaPhone;
      }

      if (!phone) {
        results.push({
          reminderId: reminder.id,
          status: "skipped_no_phone",
        });
        continue;
      }

      // Make the Twilio call
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://callio-iota.vercel.app";
      const callRes = await fetch(`${baseUrl}/api/reminder-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          taskTitle: task.title,
          taskTime: task.due_time,
        }),
      });

      const callData = await callRes.json().catch(() => ({}));

      // Mark reminder as sent regardless of call outcome
      await supabase
        .from("reminders")
        .update({ sent: true })
        .eq("id", reminder.id);

      results.push({
        reminderId: reminder.id,
        status: callRes.ok ? "called" : "call_failed",
        callSid: callData.callSid,
      });
    }

    return Response.json({
      ok: true,
      processed: results.length,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Cron] send-reminders error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
