import { html } from "lit";
import { SuiElement } from "@sakai-ui/sui-element";
import "@sakai-ui/sui-button";
import "@sakai-ui/sui-widgets";
import "@lion/dialog";
import "../sui-course-dashboard-template-picker.js";
import "../sui-course-header.js";
import "../sui-course-overview.js";

export class SuiCourseDashboard extends SuiElement {

  constructor() {

    super();

    this.loadTranslations("dashboard").then(r => this.i18n = r);
  }

  static get properties() {

    return {
      data: { type: Object },
      i18n: Object,
      state: String,
      userId: { attribute: "user-id", type: String },
      siteId: { attribute: "site-id", type: String },
      editing: { type: Boolean },
    };
  }

  set siteId(value) {

    this._siteId = value;
    this.loadData();
  }

  get siteId() { return this._siteId; }

  loadData() {

    const url = `/api/sites/${this.siteId}/dashboard`;
    fetch(url, { credentials: "include" })
      .then(r => {

        if (r.ok) {
          return r.json();
        }
        throw new Error(`Failed to get dashboard data from ${url}`);

      })
      .then(r => this.data = r)
      .catch(error => console.error(error));
  }

  shouldUpdate() {
    return this.i18n && this.data;
  }

  widgetLayoutChanged(e) {
    this.data.layout = e.detail.layout;
  }

  overviewChanged(e) {

    this.data.overview = e.detail.content;
    this.requestUpdate();
  }

  edit() {

    this.editing = !this.editing;
    this.imageBackup = this.data.image;
    this.overviewBackup = this.data.overview;
    this.programmeBackup = this.data.programme;
    this.layoutBackup = [ ...this.data.layout ];
    this.templateBackup = this.data.template;
  }

  cancel() {

    this.editing = false;
    this.data.overview = this.overviewBackup;
    this.data.programme = this.programmeBackup;
    document.getElementById("course-dashboard-programme").innerHTML = this.data.programme;
    this.data.layout = [ ...this.layoutBackup ];
    this.data.template = this.templateBackup;
    URL.revokeObjectURL(this.image);
    this.data.image = this.imageBackup;
    this.requestUpdate();
  }

  save() {

    this.editing = !this.editing;

    if (this.newImageBlob) {

      const fd = new FormData();
      fd.append("siteImage", this.newImageBlob);

      const imageUrl = `/api/sites/${this.siteId}/image`;
      fetch(imageUrl, {
        method: "POST",
        credentials: "include",
        body: fd,
      }).then(r => {

        if (!r.ok) {
          throw new Error(`Failed to update image for url ${imageUrl}`);
        } else {
          URL.revokeObjectURL(this.data.image);
          return r.text();
        }
      })
      .then(newUrl => {

        // Add a version string so the browser picks up the new image
        this.data.image = `${newUrl}?version=${Math.random()}`;
        this.requestUpdate();
      })
      .catch(error => console.error(error.message));
    }

    const data = {
      layout: this.data.layout,
      overview: this.data.overview,
      programme: this.data.programme,
      template: this.data.template.id,
    };

    const url = `/api/sites/${this.siteId}/dashboard`;
    fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => {

      if (!r.ok) {
        throw new Error(`Failed to update dashboard for url ${url}`);
      }
    }).catch(error => console.error(error.message));
  }

  imageEdited(e) {

    this.data.image = e.detail.url;
    this.newImageBlob = e.detail.blob;
    this.requestUpdate();
  }

  showTemplates() {
    document.getElementById("templates").__toggle();
  }

  templateSelected(e) {

    this.data.template = e.detail.template;

    if (this.data.template.id == 1) {
      this.data.layout = this.data.defaultWidgetLayouts["1"];
    }
    if (this.data.template.id == 2) {
      this.data.layout = this.data.defaultWidgetLayouts["2"];
    }
    if (this.data.template.id == 3) {
      this.data.layout = this.data.defaultWidgetLayouts["3"];
    }

    this.requestUpdate();

    this.updateComplete.then(() => {
      this.querySelector("#course-dashboard-save sui-button").focus();
    });
  }

  programmeUpdated(e) {
    this.data.programme = e.target.innerText;
  }

  titleBlock() {

    return html`
      <div id="course-dashboard-title-and-edit-block">
        <div id="course-dashboard-title-block">
          <h2>${this.data.title}</h2>
          <div id="course-dashboard-programme" @input=${this.programmeUpdated} ?contenteditable=${this.editing}>${this.data.programme}</div>
        </div>
        <div id="course-dashboard-edit-block">
          ${this.data.editable ? html`
            ${this.editing ? html`
              <div id="course-dashboard-layout">
                <sui-button title="${this.i18n.layout_tooltip}" @click=${this.showTemplates}>${this.i18n.layout}</sui-button>
              </div>
              <div id="course-dashboard-save">
                <sui-button @click=${this.save} title="${this.i18n.save_tooltip}" aria-label="${this.i18n.save_tooltip}" primary>${this.i18n.save}</sui-button>
              </div>
              <div id="course-dashboard-cancel">
                <sui-button @click=${this.cancel} title="${this.i18n.cancel_tooltip}" aria-label="${this.i18n.cancel_tooltip}">${this.i18n.cancel}</sui-button>
              </div>
            ` : html`
              <div id="course-dashboard-edit">
                <sui-button slot="invoker" @click=${this.edit} title="${this.i18n.edit_tooltip}" arial-label="${this.i18n.edit_tooltip}">${this.i18n.edit}</sui-button>
              </div>
            `}
          ` : ""}
        </div>
      </div>
    `;
  }

  widgetPanel(columns) {

    return html`
      <sui-widget-panel
        id="course-dashboard-widget-grid"
        @changed=${this.widgetLayoutChanged}
        widget-ids=${JSON.stringify(this.data.widgets)}
        layout=${JSON.stringify(this.data.layout)}
        site-id="${this.siteId}"
        user-id="${this.userId}"
        columns=${columns}
        ?editing=${this.editing}
      >
    `;
  }

  template1() {

    return html`
      ${this.titleBlock()}
      <div id="course-dashboard-l1-overview-and-widgets-block">
        <div id="course-dashboard-l1-overview-block">
          ${this.renderOverview()}
        </div>
        <div id="course-dashboard-l1-widgets">
          ${this.widgetPanel(1)}
        </div>
      </div>
    `;
  }

  template2() {

    return html`
      ${this.titleBlock()}
      <div id="course-dashboard-l2-header-and-overview-block">
        <div id="course-dashboard-l2-header-block">
          <sui-course-header site="${JSON.stringify(this.data)}" @image-edited=${this.imageEdited} ?editing=${this.editing}></sui-course-header>
        </div>
        <div id="course-dashboard-l2-course-overview">
          ${this.renderOverview()}
        </div>
      </div>
      <div id="course-dashboard-l2-widgets">
        ${this.widgetPanel(3)}
      </div>
    `;
  }


  template3() {

    return html`
      ${this.titleBlock()}
      <div id="course-dashboard-l3-overview-and-widgets-block">
        <div id="course-dashboard-l3-overview-block">
          ${this.renderOverview()}
        </div>
        <div id="course-dashboard-l3-widgets">
          ${this.widgetPanel(2)}
        </div>
      </div>
    `;
  }

  renderOverview() {
    return html`
      <sui-course-overview @changed=${this.overviewChanged} overview="${this.data.overview || ""}" ?editing=${this.editing}>
    `;
  }

  render() {

    return html`
      <lion-dialog id="templates">
        <sui-course-dashboard-template-picker .template=${this.data.template} slot="content" @template-selected=${this.templateSelected}>
        <div slot="invoker" style="display: none;"></div>
      </lion-dialog>
      <div class="course-dashboard-container">
        ${this.data.template.id == 1 ? this.template1() : ""}
        ${this.data.template.id == 2 ? this.template2() : ""}
        ${this.data.template.id == 3 ? this.template3() : ""}
      </div>
    `;
  }
}
