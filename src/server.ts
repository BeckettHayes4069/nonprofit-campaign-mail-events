import { createServer } from "node:http";
import { CampaignRequest, sendCampaign } from "./campaign.js";

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/campaign/send") { res.writeHead(404).end(); return; }
  try {
    const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(chunk as Buffer);
    const result = await sendCampaign(JSON.parse(Buffer.concat(chunks).toString()));
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(result));
  } catch (error) {
    const status = error instanceof Error && error.name === "ZodError" ? 400 : 502;
    res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify({ error: error instanceof Error ? error.message : "request failed" }));
  }
});
server.listen(Number(process.env.PORT ?? 3000), () => console.log("campaign service listening"));
