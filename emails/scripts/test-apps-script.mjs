/**
 * JG Email Draft Generator — local Apps Script simulation test.
 *
 * Runs Assets.gs + Code.gs in a Node vm with stand-ins for the Apps Script
 * globals (Utilities, HtmlService, the Gmail advanced service), then parses
 * the MIME message that would be stored as a Gmail draft and checks it:
 *   - multipart/related → multipart/alternative (text/plain + text/html)
 *     + one inline image part per CID;
 *   - the HTML / text parts decode to the repository email byte-for-byte;
 *   - every cid: in the HTML has a matching Content-ID part (and vice versa),
 *     and each image part is the exact PNG from emails/assets/;
 *   - the RFC 2047 subject decodes to the requested subject;
 *   - invalid input throws BEFORE anything reaches Gmail;
 *   - nothing but Users.Drafts.create / Users.getProfile is touched: every
 *     other Gmail, GmailApp or MailApp access (e.g. a send) throws.
 *
 * This is NOT a real Gmail runtime test. It cannot prove Google-side
 * behaviour (OAuth, the advanced service, Gmail rendering).
 *
 *   node emails/scripts/test-apps-script.mjs [--eml <path>]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import vm from "node:vm";
import { CID_ASSETS, ASSET_DIR } from "./cid-assets.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = join(ROOT, "emails/apps-script");
const EXPECTED_HTML = readFileSync(join(ROOT, "emails/jg-introduction-v2.html"), "utf8");
const EXPECTED_TEXT = readFileSync(join(ROOT, "emails/jg-introduction-v2.txt"), "utf8");

const failures = [];
const check = (ok, msg) => ok || failures.push(msg);

// ---- Apps Script stand-ins -------------------------------------------------
const toBuffer = (data) =>
  typeof data === "string" ? Buffer.from(data, "utf8") : Buffer.from(data.map((b) => b & 255));
const forbidden = (name) =>
  new Proxy(
    {},
    {
      get(_, prop) {
        throw new Error(`Forbidden access in simulation: ${name}.${String(prop)}`);
      },
    },
  );

function makeContext({ profileFails = false } = {}) {
  const drafts = [];
  const Utilities = {
    Charset: { UTF_8: "UTF-8" },
    base64Encode: (data) => toBuffer(data).toString("base64"),
    base64EncodeWebSafe: (data) => toBuffer(data).toString("base64").replace(/\+/g, "-").replace(/\//g, "_"),
    base64Decode: (s) => [...Buffer.from(s, "base64")].map((b) => (b > 127 ? b - 256 : b)),
    newBlob: (bytes, contentType, name) => ({
      getBytes: () => bytes,
      getContentType: () => contentType,
      getName: () => name,
    }),
    getUuid: () => randomUUID(),
  };
  const file = (name) => readFileSync(join(DIR, `${name}.html`), "utf8");
  const HtmlService = {
    createTemplateFromFile: (name) => ({ getRawContent: () => file(name) }),
    createHtmlOutputFromFile: (name) => {
      const out = { getContent: () => file(name), setTitle: () => out, addMetaTag: () => out };
      return out;
    },
  };
  const Drafts = new Proxy(
    {
      create: (resource, userId) => {
        drafts.push({ resource, userId });
        return { id: `r-${drafts.length}`, message: { id: `m-${drafts.length}` } };
      },
    },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        throw new Error(`Forbidden access in simulation: Gmail.Users.Drafts.${String(prop)}`);
      },
    },
  );
  const Users = new Proxy(
    {
      Drafts,
      getProfile: () => {
        if (profileFails) throw new Error("insufficient scope");
        return { emailAddress: "felado@example.com" };
      },
    },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        throw new Error(`Forbidden access in simulation: Gmail.Users.${String(prop)}`);
      },
    },
  );
  const context = vm.createContext({
    Utilities,
    HtmlService,
    Gmail: { Users },
    GmailApp: forbidden("GmailApp"),
    MailApp: forbidden("MailApp"),
    console,
  });
  for (const name of ["Assets.gs", "Code.gs"]) {
    vm.runInContext(readFileSync(join(DIR, name), "utf8"), context, { filename: name });
  }
  return { context, drafts, call: (expr) => vm.runInContext(expr, context) };
}

// ---- Minimal MIME parser (enough for this message shape) -------------------
function parsePart(raw) {
  const split = raw.indexOf("\r\n\r\n");
  const headerText = raw.slice(0, split).replace(/\r\n[ \t]+/g, " ");
  const body = raw.slice(split + 4);
  const headers = {};
  for (const line of headerText.split("\r\n")) {
    const i = line.indexOf(":");
    headers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  const type = headers["content-type"] ?? "";
  const boundary = type.match(/boundary="([^"]+)"/)?.[1];
  if (!boundary) return { headers, body };
  const children = body
    .split(`--${boundary}`)
    .slice(1)
    .filter((chunk) => !chunk.startsWith("--"))
    .map((chunk) => parsePart(chunk.replace(/^\r\n/, "").replace(/\r\n$/, "")));
  return { headers, children };
}
const decodeB64 = (body) => Buffer.from(body.replace(/\s+/g, ""), "base64");
const decodeHeader = (value) =>
  value.replace(/=\?UTF-8\?B\?([^?]+)\?=\s*/g, (_, b64) => Buffer.from(b64, "base64").toString("utf8"));

function verifyDraft(draft, { subject, to, expectFrom }) {
  check(draft.userId === "me", "Drafts.create userId must be 'me'");
  const mime = Buffer.from(draft.resource.message.raw.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  check(/^[\x00-\x7F]*$/.test(mime), "MIME must be 7-bit ASCII");
  check(mime.split("\r\n").every((line) => line.length <= 998), "MIME line longer than 998 chars");

  const root = parsePart(mime);
  check(root.headers["mime-version"] === "1.0", "MIME-Version header missing");
  check(root.headers.to === to, `To header: ${root.headers.to}`);
  check(decodeHeader(root.headers.subject) === subject, `Subject decodes to: ${decodeHeader(root.headers.subject)}`);
  check(
    expectFrom ? root.headers.from === `"JG Investment Plus Kft." <felado@example.com>` : !("from" in root.headers),
    `From header: ${root.headers.from}`,
  );
  check(/^multipart\/related;/.test(root.headers["content-type"]), "root is not multipart/related");

  const [alternative, ...images] = root.children ?? [];
  check(/^multipart\/alternative;/.test(alternative?.headers["content-type"]), "first part is not multipart/alternative");
  const [textPart, htmlPart] = alternative?.children ?? [];
  check(/^text\/plain; charset="UTF-8"/.test(textPart?.headers["content-type"]), "text/plain part missing");
  check(/^text\/html; charset="UTF-8"/.test(htmlPart?.headers["content-type"]), "text/html part missing");
  check(decodeB64(textPart.body).toString("utf8") === EXPECTED_TEXT, "text/plain differs from emails/jg-introduction-v2.txt");
  const html = decodeB64(htmlPart.body).toString("utf8");
  check(html === EXPECTED_HTML, "text/html differs from emails/jg-introduction-v2.html");

  const htmlCids = new Set([...html.matchAll(/src="cid:([A-Za-z0-9]+)"/g)].map((m) => m[1]));
  const partCids = new Set();
  for (const part of images) {
    const cid = part.headers["content-id"]?.match(/^<([^>]+)>$/)?.[1];
    partCids.add(cid);
    const asset = CID_ASSETS[cid];
    check(Boolean(asset), `image part with unknown Content-ID: ${cid}`);
    if (!asset) continue;
    check(part.headers["content-type"].startsWith(asset.mimeType), `${cid}: wrong Content-Type`);
    check(/^inline;/.test(part.headers["content-disposition"]), `${cid}: not Content-Disposition inline`);
    check(decodeB64(part.body).equals(readFileSync(join(ROOT, ASSET_DIR, asset.file))), `${cid}: bytes differ from ${asset.file}`);
  }
  check(images.length === Object.keys(CID_ASSETS).length, `expected ${Object.keys(CID_ASSETS).length} image parts, got ${images.length}`);
  for (const cid of htmlCids) check(partCids.has(cid), `cid:${cid} in HTML has no inline part`);
  for (const cid of partCids) check(htmlCids.has(cid), `inline part ${cid} is not used by the HTML`);
  return mime;
}

// ---- Scenarios -------------------------------------------------------------
let mimeForEml = "";
{
  const sim = makeContext();
  const result = sim.call(`createJgIntroductionDraft('ugyfel@example.com')`);
  check(result.draftId === "r-1" && result.messageId === "m-1", "draft id / message id not returned");
  check(sim.drafts.length === 1, "exactly one draft expected");
  mimeForEml = verifyDraft(sim.drafts[0], {
    subject: "JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke",
    to: "ugyfel@example.com",
    expectFrom: true,
  });
}
{
  const sim = makeContext();
  const subject = "Egyedi tárgy – őszi egyeztetés, JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke";
  sim.context.__form = { to: " a@example.com , b.c@example.org ", subject };
  const result = sim.call(`createDraftFromUi(__form)`);
  check(result.to === "a@example.com, b.c@example.org", `UI recipients normalised: ${result.to}`);
  verifyDraft(sim.drafts[0], { subject, to: "a@example.com, b.c@example.org", expectFrom: true });
}
{
  const sim = makeContext();
  sim.call(`createSampleDraftToSelf()`);
  verifyDraft(sim.drafts[0], {
    subject: "JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke",
    to: "felado@example.com",
    expectFrom: true,
  });
}
{
  const sim = makeContext({ profileFails: true });
  sim.call(`createJgIntroductionDraft('ugyfel@example.com', 'Tárgy')`);
  verifyDraft(sim.drafts[0], { subject: "Tárgy", to: "ugyfel@example.com", expectFrom: false });
}
{
  const invalid = [
    [`createJgIntroductionDraft('', 'Tárgy')`, "empty recipient"],
    [`createJgIntroductionDraft('   ', 'Tárgy')`, "blank recipient"],
    [`createJgIntroductionDraft('nem-email', 'Tárgy')`, "malformed recipient"],
    [`createJgIntroductionDraft('a@b', 'Tárgy')`, "recipient without TLD"],
    [`createJgIntroductionDraft('Név <a@example.com>', 'Tárgy')`, "display-name recipient"],
    [`createJgIntroductionDraft('a@example.com\\r\\nBcc: x@example.com', 'Tárgy')`, "header injection in To"],
    [`createJgIntroductionDraft('a@example.com', '')`, "empty subject"],
    [`createJgIntroductionDraft('a@example.com', '   ')`, "blank subject"],
    [`createJgIntroductionDraft('a@example.com', 'x\\nBcc: y@example.com')`, "header injection in Subject"],
    [`createDraftFromUi(null)`, "missing form"],
  ];
  for (const [expr, label] of invalid) {
    const sim = makeContext();
    let threw = false;
    try {
      sim.call(expr);
    } catch {
      threw = true;
    }
    check(threw, `invalid input accepted: ${label}`);
    check(sim.drafts.length === 0, `draft created despite invalid input: ${label}`);
  }
}
{
  const sim = makeContext();
  const out = sim.call(`doGet()`);
  check(typeof out.getContent === "function", "doGet() must return an HtmlOutput");
}

const emlAt = process.argv.indexOf("--eml");
if (emlAt !== -1 && process.argv[emlAt + 1]) {
  writeFileSync(process.argv[emlAt + 1], mimeForEml);
  console.log(`  wrote ${process.argv[emlAt + 1]}`);
}

if (failures.length) {
  console.error(`✗ Apps Script simulation: ${failures.length} problem(s)\n  - ${failures.join("\n  - ")}`);
  process.exit(1);
}
console.log("✓ Apps Script simulation passed — 4 drafts built and verified, 10 invalid inputs rejected, no send path touched");
