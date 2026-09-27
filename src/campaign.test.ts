import assert from "node:assert/strict";
import { classifyEvents, messageFor } from "./campaign.js";

assert.equal(classifyEvents([{ type: "open" }]), "opened");
assert.equal(classifyEvents([{ type: "bounce" }]), "bounced");
assert.equal(classifyEvents([]), "pending");
assert.match(messageFor({ kind: "receipt", to: "donor@example.org", donorName: "Lin", amountCents: 2500 }).subject, /receipt/);
console.log("campaign decisions pass");
