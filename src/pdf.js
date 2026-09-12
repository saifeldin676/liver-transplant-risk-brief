/* ─────────────────────────────────────────────────────────────────────────
   MELD+ — PDF one-pager.

   Why this file exists: window.print() is a no-op inside the iOS WKWebView
   that Capacitor wraps the app in, so the CSS @media print sheet never
   reaches a printer on a phone. We draw the same one-pager directly into a
   real PDF instead, then hand the file to the native share sheet, which is
   where "Print", "Save to Files" and "Mail" actually live on a device.

   Layout intentionally mirrors the .brief-print CSS: A4 portrait, 10 mm
   margins, five score boxes across the top, red flags boxed, then two
   columns of pre-induction checklists.
   ───────────────────────────────────────────────────────────────────────── */

import { jsPDF } from "jspdf";

const PT = 0.3527777778;       // 1 pt in mm
const PAGE_W = 210;
const PAGE_H = 297;
const M = 10;                  // page margin, mm
const CONTENT_W = PAGE_W - M * 2;
const BOTTOM = PAGE_H - M - 8; // leave room for the footer rule

/* The built-in Helvetica is Latin-1 only. Embedding a Unicode face would add
   hundreds of kilobytes to the bundle for a handful of glyphs, so the few
   non-Latin-1 characters the brief uses are folded to ASCII equivalents.
   Checkboxes are not folded — they are drawn as real squares below. */
const GLYPH = {
  "≤": "<=", "≥": ">=", "Δ": "delta ", "⁺": "+",
  "⁻": "-", "⁵": "5", "─": "-", "⚠": "!",
  "→": "->", "–": "-", "—": "-", "’": "'",
  "“": '"', "”": '"', "℃": "C", "²": "2",
};
const clean = (s) =>
  String(s == null ? "" : s)
    .replace(/[≤≥Δ⁺⁻⁵─⚠→–—’“”℃²]/g, (c) => GLYPH[c])
    .replace(/☐\s*/g, "")        // checkbox marker — drawn, not typed
    .replace(/[^\x00-\xFF]/g, "");    // anything else outside Latin-1

const hasBox = (s) => /^\s*☐/.test(String(s ?? ""));

/* A column that flows downward and starts a new page when it runs out of
   room, so a long brief degrades into page 2 instead of being clipped. */
class Col {
  constructor(doc, x, w, top) {
    this.doc = doc; this.x = x; this.w = w; this.top = top; this.y = top;
    this.page = doc.getCurrentPageInfo().pageNumber;
  }
  ensure(h) {
    const doc = this.doc;
    if (this.y + h > BOTTOM) {
      const n = this.page + 1;
      while (doc.getNumberOfPages() < n) doc.addPage();
      this.page = n; this.y = this.top;
    }
    doc.setPage(this.page);
  }
  /* Section heading: uppercase, ruled underneath. */
  head(text) {
    const doc = this.doc;
    this.ensure(6);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
    doc.text(clean(text).toUpperCase(), this.x, this.y + 2.6);
    doc.setLineWidth(0.27); doc.setDrawColor(0);
    doc.line(this.x, this.y + 3.6, this.x + this.w, this.y + 3.6);
    this.y += 5.2;
  }
  /* One body line. Wraps, and draws a tick-box when the source line had one. */
  line(text, opts = {}) {
    const doc = this.doc;
    const box = opts.box ?? hasBox(text);
    const size = opts.size ?? 8.5;
    const bold = opts.bold ?? false;
    const indent = box ? 4 : 0;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const rows = doc.splitTextToSize(clean(text), this.w - indent);
    const lh = size * 1.32 * PT;
    this.ensure(rows.length * lh + 0.7);
    if (box) {
      doc.setLineWidth(0.22);
      doc.rect(this.x, this.y + 0.5, 2.5, 2.5);
    }
    doc.text(rows, this.x + indent, this.y + size * 0.95 * PT);
    this.y += rows.length * lh + 0.7;
    return this;
  }
  gap(mm = 2.4) { this.y += mm; return this; }
}

/* ── the document ─────────────────────────────────────────────────────── */
export function buildBriefPdf(d) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  doc.setTextColor(0);

  /* Header — title block left, blank addressograph box right. The app never
     captures identifiers, so the label is applied by hand after printing. */
  doc.setFont("helvetica", "bold"); doc.setFontSize(15);
  doc.text("MELD+ . Perioperative Risk Brief", M, M + 5);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.setTextColor(68);
  doc.text("Liver transplant anesthesia . clinical decision support", M, M + 9.2);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text(clean(d.caseLabel), M, M + 13);
  doc.setFont("helvetica", "normal");
  doc.text(` . ${clean(d.stamp)} . no identifiers auto-filled`,
    M + doc.getTextWidth(clean(d.caseLabel)), M + 13);

  const SW = 78, SH = 30, SX = PAGE_W - M - SW;
  doc.setLineWidth(0.27); doc.setDrawColor(85);
  doc.setLineDashPattern([1.2, 1.2], 0);
  doc.rect(SX, M, SW, SH);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(6.5); doc.setTextColor(136);
  doc.text("PATIENT LABEL", SX + 1.2, M + 3);
  doc.setTextColor(0); doc.setDrawColor(0);

  let y = M + SH + 3;
  doc.setLineWidth(0.7);
  doc.line(M, y, PAGE_W - M, y);
  y += 3.5;

  /* Implausible-value warning, if the harness flagged any. */
  if (d.implausibleCount > 0) {
    doc.setFillColor(242); doc.setLineWidth(0.35);
    doc.rect(M, y, CONTENT_W, 6, "FD");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
    doc.text(clean(`! ${d.implausibleCount} entered value${d.implausibleCount === 1 ? " is" : "s are"} outside the expected range - verify before use.`),
      M + 1.8, y + 4);
    y += 8;
  }

  /* Five score boxes across. */
  const n = d.scores.length, gap = 1.5;
  const bw = (CONTENT_W - gap * (n - 1)) / n, bh = 16;
  d.scores.forEach(([k, val, sub], i) => {
    const x = M + i * (bw + gap);
    doc.setLineWidth(0.35); doc.rect(x, y, bw, bh);
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(51);
    doc.text(clean(k).toUpperCase(), x + bw / 2, y + 3.4, { align: "center" });
    doc.setTextColor(0); doc.setFont("helvetica", "bold"); doc.setFontSize(17);
    doc.text(clean(val), x + bw / 2, y + 10.4, { align: "center", maxWidth: bw - 2 });
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(51);
    doc.text(doc.splitTextToSize(clean(sub), bw - 2).slice(0, 1), x + bw / 2, y + 14, { align: "center" });
    doc.setTextColor(0);
  });
  y += bh + 3;

  /* Entered values, one wrapped line. */
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  const inRows = doc.splitTextToSize(clean(d.inputs || "No values entered."), CONTENT_W);
  doc.text(inRows, M, y + 2.6);
  y += inRows.length * 8 * 1.3 * PT + 1.5;
  doc.setLineWidth(0.18); doc.setDrawColor(153);
  doc.line(M, y, PAGE_W - M, y);
  doc.setDrawColor(0);
  y += 3.5;

  /* Red flags — boxed, first thing the eye should land on. */
  const flagH = 6 + Math.max(1, d.flags.length) * 4.2;
  doc.setLineWidth(0.55);
  doc.rect(M, y, CONTENT_W, flagH);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text(`RED FLAGS (${d.flags.length})`, M + 2, y + 4);
  let fy = y + 7.6;
  doc.setFontSize(8.5);
  if (d.flags.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.text("None from current inputs.", M + 2, fy);
  } else {
    d.flags.forEach((r) => {
      const hi = r.l === "high";
      doc.setLineWidth(0.27);
      if (hi) { doc.setFillColor(0); doc.rect(M + 2, fy - 2.6, 9, 3.4, "FD"); doc.setTextColor(255); }
      else { doc.rect(M + 2, fy - 2.6, 9, 3.4); doc.setTextColor(0); }
      doc.setFont("helvetica", "bold"); doc.setFontSize(6.5);
      doc.text(hi ? "HIGH" : "MED", M + 6.5, fy, { align: "center" });
      doc.setTextColor(0);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      doc.text(doc.splitTextToSize(clean(r.t), CONTENT_W - 16).slice(0, 1), M + 13, fy);
      fy += 4.2;
    });
  }
  y += flagH + 3.5;

  /* Two checklist columns. */
  const colW = (CONTENT_W - 6) / 2;
  const L = new Col(doc, M, colW, y);
  const R = new Col(doc, M + colW + 6, colW, y);

  L.head("Intraoperative CRRT");
  L.line(d.crrt.verdict, { bold: true, size: 9.5, box: false });
  d.crrt.met.forEach((t) => L.line(t, { box: true }));
  if (d.crrt.antic) L.line(`Anticipate: ${d.crrt.antic}`, { box: false });
  if (d.crrt.notify) L.line(d.crrt.notify, { box: true });
  L.gap();

  if (d.na) {
    L.head(d.na.head);
    d.na.lines.forEach((t) => L.line(t));
    L.gap();
  }

  if (d.ph) {
    R.head(d.ph.head);
    d.ph.lines.forEach((t) => R.line(t));
    R.gap();
  }
  if (d.other && d.other.length) {
    R.head("Other key plan points");
    d.other.forEach((t) => R.line(t, { box: true }));
    R.gap();
  }
  if (d.alloc && d.alloc.length) {
    R.head("Allocation");
    d.alloc.forEach((t) => R.line(t, { box: false }));
  }

  /* Footer on every page. */
  const foot =
    "MELD+ is clinical decision support for licensed clinicians. It does not diagnose, prescribe, or replace clinical " +
    "judgment, institutional protocol, or current OPTN policy. Composite risk is a heuristic, not an allocation score. " +
    "Verify allocation questions at optn.transplant.hrsa.gov. The app stores and transmits nothing - but once a patient " +
    "label is applied, this sheet carries identifiers: file it in the record or dispose of it per your institution's policy.";
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setLineWidth(0.18); doc.setDrawColor(153);
    doc.line(M, PAGE_H - M - 7.5, PAGE_W - M, PAGE_H - M - 7.5);
    doc.setDrawColor(0);
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(51);
    doc.text(doc.splitTextToSize(foot, CONTENT_W), M, PAGE_H - M - 5);
    if (pages > 1) doc.text(`${p} / ${pages}`, PAGE_W - M, PAGE_H - M - 0.5, { align: "right" });
    doc.setTextColor(0);
  }

  return doc.output("blob");
}

/* Hand the PDF to the platform. On iOS and Android the share sheet is the
   only route to a printer from inside a web view; on desktop browsers there
   is no share sheet, so the file is downloaded instead. */
export async function deliverPdf(blob, filename) {
  const file = typeof File === "function"
    ? new File([blob], filename, { type: "application/pdf" })
    : null;

  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return "shared";
    } catch (e) {
      if (e && e.name === "AbortError") return "cancelled";
      /* fall through to download */
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return "downloaded";
  } catch {
    return "failed";
  }
}
