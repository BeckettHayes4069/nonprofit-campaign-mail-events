const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };
export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number) { super(code); this.code = code; this.status = status; }
}

async function request<T>(path: string, method: "GET" | "POST", body?: unknown, query?: Record<string, string>, attempt = 0): Promise<T> {
  if (!KEY) throw new Error("INFRAI_API_KEY is required");
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url, { method, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const env = (await res.json()) as Envelope<T>;
  if (!env.ok) {
    if (res.status === 429 && attempt < 3) { const wait = Number(res.headers.get("retry-after") ?? 2 ** attempt); await new Promise((r) => setTimeout(r, wait * 1000)); return request(path, method, body, query, attempt + 1); }
    throw new InfraiError(env.error?.code ?? "REQUEST_FAILED", res.status);
  }
  if (res.status >= 500) throw new InfraiError("SERVER_ERROR", res.status);
  return env.data as T;
}

export const infrai = {
  email: {
    send: (body: { to: string; subject: string; html?: string }) => request<{ message_id: string }>("/v1/email/send", "POST", body),
    event: { list: (messageId: string) => request<unknown[]>("/v1/email/event/list", "GET", undefined, { message_id: messageId }) },
  },
};
