import { z } from "zod";
import { infrai } from "./infrai.js";

export const CampaignRequest = z.object({ kind: z.enum(["receipt", "reminder"]), to: z.string().email(), donorName: z.string().min(1), amountCents: z.number().int().positive().optional() });
export type CampaignRequest = z.infer<typeof CampaignRequest>;

export function messageFor(input: CampaignRequest) {
  if (input.kind === "receipt") return { subject: `Donation receipt for ${input.donorName}`, html: `<p>Thank you, ${input.donorName}. Your gift was recorded.</p>` };
  return { subject: `Volunteer reminder for ${input.donorName}`, html: `<p>Please confirm your campaign shift.</p>` };
}

export function classifyEvents(events: unknown[]): "opened" | "bounced" | "pending" {
  const text = JSON.stringify(events).toLowerCase();
  if (text.includes("bounce")) return "bounced";
  if (text.includes("open")) return "opened";
  return "pending";
}

export async function sendCampaign(input: CampaignRequest) {
  const parsed = CampaignRequest.parse(input);
  const sent = await infrai.email.send({ to: parsed.to, ...messageFor(parsed) });
  const events = await infrai.email.event.list(sent.message_id);
  return { messageId: sent.message_id, status: classifyEvents(events) };
}
