/**
 * JG Email Draft Generator v1 — Google Apps Script
 * ------------------------------------------------
 * Creates the "JG Investment Plus — bemutatkozó e-mail v2" as a Gmail DRAFT
 * in the mailbox of the Google account that runs the script.
 *
 * DRAFT ONLY. This project never sends email. It contains no send call of
 * any kind; sending is always a manual, human action in Gmail after review.
 * (emails/scripts/check-email.mjs fails the build if a send call appears.)
 *
 * Workflow:
 *   private template → CID inline images → Apps Script → Gmail draft
 *   → human review in Gmail → manual send
 *
 * Why the Gmail advanced service and not GmailApp.createDraft():
 *   GmailApp requires the full https://mail.google.com/ scope (read, delete,
 *   everything). The Gmail API's users.drafts.create works with the narrower
 *   https://www.googleapis.com/auth/gmail.compose scope, so the script builds
 *   the MIME message itself (multipart/related with CID inline images) and
 *   stores it as a draft. Result in Gmail is the same: an HTML draft with
 *   inline images and a plain-text alternative.
 *
 * Files in this project:
 *   Code.gs                  — this file (server logic)
 *   Assets.gs                — generated: the 7 inline PNGs (base64) by CID
 *   JGIntroductionV2.html    — generated: the email HTML (src="cid:…")
 *   JGIntroductionV2Text.html — generated: the plain-text alternative
 *   Index.html               — internal draft-generator UI (doGet)
 *   appsscript.json          — manifest (V8, gmail.compose only)
 *
 * The generated files are built from the repository by
 * emails/scripts/build-apps-script.mjs — edit the sources, not the copies.
 */

/** Default subject — the approved website title. Editable per draft. */
const JG_DEFAULT_SUBJECT = 'JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke';

/** Display name used in the From header when the sender address is known. */
const JG_SENDER_NAME = 'JG Investment Plus Kft.';

const JG_TEMPLATE_HTML = 'JGIntroductionV2';
const JG_TEMPLATE_TEXT = 'JGIntroductionV2Text';

const JG_MAX_RECIPIENTS = 20;
const JG_MAX_SUBJECT_LENGTH = 200;

/** Web app entry point: the internal draft-generator form. */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('JG Email Draft Generator')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Called from Index.html via google.script.run.
 * @param {{to: string, subject: string}} form
 * @return {{draftId: string, messageId: string, to: string, subject: string}}
 */
function createDraftFromUi(form) {
  if (!form || typeof form !== 'object') {
    throw new Error('Hiányzó űrlapadatok.');
  }
  return createJgIntroductionDraft(form.to, form.subject);
}

/**
 * Creates the JG introduction email as a Gmail DRAFT. Never sends.
 *
 * @param {string} to       One address, or several separated by commas.
 * @param {string=} subject Optional; defaults to JG_DEFAULT_SUBJECT. An
 *                          explicitly empty subject is rejected.
 * @return {{draftId: string, messageId: string, to: string, subject: string}}
 */
function createJgIntroductionDraft(to, subject) {
  const recipients = validateRecipients_(to);
  const finalSubject = validateSubject_(subject === undefined ? JG_DEFAULT_SUBJECT : subject);

  const html = loadTemplate_(JG_TEMPLATE_HTML);
  const text = loadTemplate_(JG_TEMPLATE_TEXT);
  const inlineImages = buildInlineImages_();
  assertCidMapping_(html, inlineImages);

  const mime = buildMimeMessage_({
    to: recipients.join(', '),
    subject: finalSubject,
    from: buildFromHeader_(),
    text: text,
    html: html,
    inlineImages: inlineImages,
  });

  // users.drafts.create — stores the message as a DRAFT only.
  const draft = Gmail.Users.Drafts.create(
    { message: { raw: Utilities.base64EncodeWebSafe(mime, Utilities.Charset.UTF_8) } },
    'me'
  );

  return {
    draftId: draft.id,
    messageId: draft.message ? draft.message.id : '',
    to: recipients.join(', '),
    subject: finalSubject,
  };
}

/**
 * First-run helper for the Apps Script editor (Run ▸ createSampleDraftToSelf):
 * triggers the one-time Gmail authorisation and creates ONE draft addressed to
 * the running account itself, for a visual check in Gmail. Never sends.
 */
function createSampleDraftToSelf() {
  const address = Gmail.Users.getProfile('me').emailAddress;
  const result = createJgIntroductionDraft(address);
  console.log('Gmail piszkozat létrehozva (nem elküldve): ' + result.draftId + ' → ' + address);
  return result;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Plain address only (no display names): local@domain.tld */
const JG_EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

function validateRecipients_(to) {
  if (typeof to !== 'string' || to.trim() === '') {
    throw new Error('A címzett e-mail-címe kötelező.');
  }
  if (/[\r\n]/.test(to)) {
    throw new Error('A címzett mező nem tartalmazhat sortörést.');
  }
  const list = to.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s !== ''; });
  if (list.length === 0) {
    throw new Error('A címzett e-mail-címe kötelező.');
  }
  if (list.length > JG_MAX_RECIPIENTS) {
    throw new Error('Legfeljebb ' + JG_MAX_RECIPIENTS + ' címzett adható meg.');
  }
  list.forEach(function (address) {
    if (!JG_EMAIL_PATTERN.test(address)) {
      throw new Error('Érvénytelen e-mail-cím: ' + address);
    }
  });
  return list;
}

function validateSubject_(subject) {
  if (typeof subject !== 'string' || subject.trim() === '') {
    throw new Error('A tárgy kötelező.');
  }
  if (/[\r\n]/.test(subject)) {
    throw new Error('A tárgy nem tartalmazhat sortörést.');
  }
  const trimmed = subject.trim();
  if (trimmed.length > JG_MAX_SUBJECT_LENGTH) {
    throw new Error('A tárgy legfeljebb ' + JG_MAX_SUBJECT_LENGTH + ' karakter lehet.');
  }
  return trimmed;
}

// ---------------------------------------------------------------------------
// Template + inline images
// ---------------------------------------------------------------------------

/** Raw file content, unprocessed (no scriptlet evaluation, no sanitising). */
function loadTemplate_(name) {
  return HtmlService.createTemplateFromFile(name).getRawContent();
}

/** Assets.gs entry → Blob. */
function createBlobFromAsset_(asset) {
  return Utilities.newBlob(Utilities.base64Decode(asset.base64), asset.mimeType, asset.filename);
}

/** CID → Blob for every asset in Assets.gs. */
function buildInlineImages_() {
  const images = {};
  Object.keys(JG_EMAIL_ASSETS).forEach(function (cid) {
    images[cid] = createBlobFromAsset_(JG_EMAIL_ASSETS[cid]);
  });
  return images;
}

/** Every cid: in the HTML has an image, and every image is used. */
function assertCidMapping_(html, inlineImages) {
  const used = {};
  const pattern = /src="cid:([A-Za-z0-9]+)"/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    used[match[1]] = true;
  }
  Object.keys(used).forEach(function (cid) {
    if (!inlineImages[cid]) throw new Error('Hiányzó inline kép a CID-hez: ' + cid);
  });
  Object.keys(inlineImages).forEach(function (cid) {
    if (!used[cid]) throw new Error('Nem használt inline kép: ' + cid);
  });
}

// ---------------------------------------------------------------------------
// MIME (RFC 2045/2046/2047/2387)
// ---------------------------------------------------------------------------

/**
 * From header with the JG display name, if the account's address can be read
 * with the gmail.compose scope. Otherwise the header is omitted and Gmail
 * uses the account's own default sender.
 */
function buildFromHeader_() {
  try {
    const address = Gmail.Users.getProfile('me').emailAddress;
    return address ? '"' + JG_SENDER_NAME + '" <' + address + '>' : '';
  } catch (e) {
    return '';
  }
}

/** RFC 2047 encoded-words, split by code point so UTF-8 is never cut. */
function encodeHeader_(value) {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  const chars = Array.from(value);
  const words = [];
  for (let i = 0; i < chars.length; i += 12) {
    const chunk = chars.slice(i, i + 12).join('');
    words.push('=?UTF-8?B?' + Utilities.base64Encode(chunk, Utilities.Charset.UTF_8) + '?=');
  }
  return words.join('\r\n ');
}

/** Base64 body wrapped at 76 characters (RFC 2045). */
function wrapBase64_(base64) {
  return (base64.match(/.{1,76}/g) || ['']).join('\r\n');
}

function buildMimeMessage_(parts) {
  const related = 'jg_related_' + Utilities.getUuid().replace(/-/g, '');
  const alternative = 'jg_alternative_' + Utilities.getUuid().replace(/-/g, '');
  const lines = [];

  lines.push('MIME-Version: 1.0');
  lines.push('To: ' + parts.to);
  if (parts.from) lines.push('From: ' + parts.from);
  lines.push('Subject: ' + encodeHeader_(parts.subject));
  lines.push('Content-Type: multipart/related; boundary="' + related + '"; type="multipart/alternative"');
  lines.push('');

  lines.push('--' + related);
  lines.push('Content-Type: multipart/alternative; boundary="' + alternative + '"');
  lines.push('');

  lines.push('--' + alternative);
  lines.push('Content-Type: text/plain; charset="UTF-8"');
  lines.push('Content-Transfer-Encoding: base64');
  lines.push('');
  lines.push(wrapBase64_(Utilities.base64Encode(parts.text, Utilities.Charset.UTF_8)));

  lines.push('--' + alternative);
  lines.push('Content-Type: text/html; charset="UTF-8"');
  lines.push('Content-Transfer-Encoding: base64');
  lines.push('');
  lines.push(wrapBase64_(Utilities.base64Encode(parts.html, Utilities.Charset.UTF_8)));
  lines.push('--' + alternative + '--');

  Object.keys(parts.inlineImages).forEach(function (cid) {
    const blob = parts.inlineImages[cid];
    const name = blob.getName();
    lines.push('--' + related);
    lines.push('Content-Type: ' + blob.getContentType() + '; name="' + name + '"');
    lines.push('Content-Transfer-Encoding: base64');
    lines.push('Content-ID: <' + cid + '>');
    lines.push('X-Attachment-Id: ' + cid);
    lines.push('Content-Disposition: inline; filename="' + name + '"');
    lines.push('');
    lines.push(wrapBase64_(Utilities.base64Encode(blob.getBytes())));
  });
  lines.push('--' + related + '--');
  lines.push('');

  return lines.join('\r\n');
}
