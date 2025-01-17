import { SuiElement } from "@sakai-ui/sui-element";
import { html } from "lit";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

/**
 * Loads a document from Sakai content hosting from the supplied ref attribute. Ref is a Sakai entity reference.
 *
 * Formats currently supported:
 * DOCX
 * ODP
 * ODT
 * PDF
 *
 * PDFs are opened with PDF.js, the same plugin used natively by Chrome and Firefox. ODP (slides) are displayed using
 * ViewerJS. DOCX and ODT are converted to html on the server and retrieved vi a Fetch call. ViewerJS and PDF.js loads
 * happen in an iframe. You can specify the height of that with the height attribute. Light dom is in use, so you can
 * style this from the usual Sakai SASS build.
 *
 * @example <caption>Usage:</caption>
 * <sui-document-viewer height="400px" ref="/content/attachment/8c563fb1-6bf8-4e01-9e25-8881f4dc35e2/Assignments/77377d3d-6deb-4c78-b69c-2821c6d0602d/nndr 2015.odp"></sui-document-viewer>
 *
 * @author Adrian Fish <adrian.r.fish@gmail.com>
 */
export class SuiDocumentViewer extends SuiElement {

  constructor() {

    super();

    this.documentMarkup = "";
    this.height = "600px";

    this.loadTranslations("document-viewer").then(t => {

      this.i18n = t;
      this.documentFailureMessage = `<div>${this.i18n.failed_to_load_document}</div>`;
      this.documentTooBigMessage = `<div>${this.i18n.document_too_big}</div>`;
      this.documentNotSupportedMessage = `<div>${this.i18n.document_not_supported}</div>`;
    });
  }

  static get properties() {

    return {
      preview: { type: Object },
      content: { type: Object },
      height: { type: String },
      //INTERNAL
      documentMarkup: { type: String },
      i18n: { type: Object },
      nomargins: { type: Boolean },
    };
  }

  set preview(newValue) {

    this._preview = newValue;
    this.loadDocumentMarkup(newValue);
  }

  get preview() { return this._preview; }

  shouldUpdate() {
    return this.i18n;
  }

  renderWithoutBorders() {

    return html`
      <div class="preview-inner ${this.nomargins ? "nomargins" : ""}">
        ${unsafeHTML(this.documentMarkup)}
      </div>
    `;
  }

  renderWithBorders() {

    return html`
      <div class="preview-outer">
        <div class="preview-middle">
          ${this.renderWithoutBorders()}
        </div>
      </div>
    `;
  }

  render() {

    return html`
      <div class="document-link">${this.i18n.viewing}: <a href="/access${this.content.ref}" target="_blank" rel="noopener">${this.content.name}</a></div>
      ${this.withBorders ? this.renderWithBorders() : this.renderWithoutBorders()}
    `;
  }

  loadDocumentMarkup(preview) {

    let ref = preview.ref;
    const type = preview.type;

    this.nomargins = false;

    this.withBorders = false;

    if (type === "application/pdf") {
      this.nomargins = true;
      // Let PDFJS handle this. We can just literally use the viewer, like Firefox and Chrome do.
      this.documentMarkup = `<iframe src="/library/webjars/pdf-js/2.9.359/web/viewer.html?file=/access/${encodeURIComponent(ref)}" width="100%" height="${this.height}" />`;
    } else if (type === "application/vnd.oasis.opendocument.presentation"
                || type === "application/vnd.oasis.opendocument.text") {
      this.nomargins = true;
      this.documentMarkup = `<iframe src="/library/webjars/viewerjs/0.5.9#/access${ref}" width="100%" height="${this.height}" />`;
    } else if (type.includes("image/")) {
      this.documentMarkup = `<img src="/access/${ref}" />`;
    } else if (type.includes("video/")) {
      this.documentMarkup = `<video controls playsinline><source src='/access/${ref}' type='${type}'></video>`;
    } else {
      this.withBorders = true;
      const contentIndex = ref.indexOf("/content/");
      ref = contentIndex >= 0 ? ref.substring(contentIndex + 8) : ref;

      fetch(`/direct/content/${portal.siteId}/htmlForRef.json?ref=${ref}`,
        { cache: "no-cache", contentcredentials: "same-origin" })
        .then(r => {

          if (r.ok) {
            return r.json();
          }

          this.documentMarkup = this.documentFailureMessage;
          throw new Error("Failed to load preview");
        })
        .then(data => {

          switch (data.status) {
            case "CONVERSION_OK":
              this.documentMarkup = data.content;
              break;
            case "CONVERSION_TOO_BIG":
              this.documentMarkup = this.documentTooBigMessage;
              break;
            case "CONVERSION_NOT_SUPPORTED":
              this.documentMarkup = this.documentNotSupportedMessage;
              break;
            default:
              this.documentMarkup = this.documentFailureMessage;
          }
        })
        .catch (error => console.error(error));
    }
  }
}
