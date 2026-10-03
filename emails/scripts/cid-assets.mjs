/**
 * JG Investment Plus — email CID map (single source of truth).
 *
 * The email embeds its images as CID inline MIME parts: the HTML references
 * `src="cid:<key>"`, the Apps Script draft generator attaches each file with
 * `Content-ID: <key>`. The keys are LOCKED — never rename them per build.
 *
 * Files live in emails/assets/ (private, not served by the website).
 */
export const CID_ASSETS = {
  jgMarkPorcelain: { file: "jg-mark-porcelain@2x.png", mimeType: "image/png" },
  jgMarkCarbon: { file: "jg-mark-carbon@2x.png", mimeType: "image/png" },
  noticeIcon: { file: "icons/notice.png", mimeType: "image/png" },
  opportunitiesIcon: { file: "icons/opportunities.png", mimeType: "image/png" },
  savingsIcon: { file: "icons/savings.png", mimeType: "image/png" },
  digitalIcon: { file: "icons/digital.png", mimeType: "image/png" },
  relationshipIcon: { file: "icons/relationship.png", mimeType: "image/png" },
};

/** Private email asset directory, relative to the repository root. */
export const ASSET_DIR = "emails/assets";
