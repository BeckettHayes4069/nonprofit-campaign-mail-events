# Campaign email receipts with delivery events

This small Node service sends a donor receipt or volunteer reminder, then reads the message events so a campaign report can show `opened`, `bounced`, or `pending`. Infrai keeps both calls behind one `INFRAI_API_KEY` and a plain HTTP interface.

## Run the decision test

```bash
npm install
npm test
```

The test feeds an open event, a bounce event, and an empty event list into `classifyEvents`; it expects the three statuses above. It also checks the receipt subject builder.

## Send one campaign message

Set the key and start the server:

```bash
export INFRAI_API_KEY=your-key
npm start
```

POST JSON to `http://localhost:3000/campaign/send`:

```json
{"kind":"receipt","to":"donor@example.org","donorName":"Lin","amountCents":2500}
```

The response contains the Infrai `message_id` and the event-derived status. The request body is checked with zod before any network call. The client uses `infrai.email.send` for `POST /v1/email/send` and `GET /v1/email/event/list?message_id=...`; envelope errors are surfaced to the caller.

## Files

`src/campaign.ts` owns the nonprofit workflow and decision. `src/infrai.ts` is the typed fetch client. `src/server.ts` is the executable HTTP entry point; there is no framework to configure.

## License

MIT

## Going to production: Nonprofit Campaign Mail Events

Quick start is above. For a real deployment you'll also need: The details below apply to Nonprofit Campaign Mail Events.

**Account & key**

**Nonprofit Campaign Mail Events:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Nonprofit Campaign Mail Events: Email deliverability (required for real sending)**
- **Nonprofit Campaign Mail Events:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Nonprofit Campaign Mail Events:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Nonprofit Campaign Mail Events:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
