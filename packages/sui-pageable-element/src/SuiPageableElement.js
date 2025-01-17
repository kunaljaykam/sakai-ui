import { LitElement, css, html } from "lit";
import "@sakai-ui/sui-pager";
import { loadProperties } from "@sakai-ui/sui-i18n";
import { ifDefined } from "lit-html/directives/if-defined.js";

export class SuiPageableElement extends LitElement {

  constructor() {

    super();

    this.pageSize = 5;
    this.currentPage = 1;
    this.allDataAtOnce = true;
  }

  static get properties() {

    return {
      siteId: { attribute: "site-id", type: String },
      userId: { attribute: "user-id", type: String },
      dataPage: { attribute: false, type: Array },
      showPager: { attribute: false, type: Boolean },
    };
  }

  set siteId(value) {
    this._siteId = value;
  }

  get siteId() { return this._siteId; }

  set userId(value) {
    this._userId = value;
  }

  get userId() { return this._userId; }

  loadTranslations(options) {
    return loadProperties(options);
  }

  _loadData() {

    if (this.allDataAtOnce) {
      this.loadAllData().then(() => {
        this.count = Math.ceil(this.data.length / this.pageSize);
        this._loadDataPage(1);
      });
    } else {
      this._loadDataPage(1);
    }
  }

  async loadAllData() {}

  _loadDataPage(page) {

    if (!this.data) {
      this.loadAllData();
    } else {
      this.currentPage = page;
      this.repage();
    }
  }

  pageClicked(e) {
    this._loadDataPage(e.detail.page);
  }

  repage() {

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.dataPage = this.data.slice(start, end);
    this.requestUpdate();
  }

  content() {}

  shouldUpdate() {
    return this.dataPage;
  }

  connectedCallback() {

    super.connectedCallback();
    this._loadData();
  }

  render() {

    return html`
      <div id="wrapper">
        <div id="content">
          ${this.content()}
        </div>
        ${this.showPager ? html`
        <div id="pager">
          <sui-pager count="${ifDefined(this.count)}" current="1" @page-selected=${this.pageClicked}></sui-pager>
        </div>
        ` : ""}
      </div>
    `;
  }

  static get styles() {

    return [
      css`
        #wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding-bottom: 0;
        }

          #topbar {
            display: flex;
            margin-top: 8px;
            margin-bottom: 20px;
          }

          #content {
            background-color: var(--sakai-dashboard-widget-bg-color, white);
            padding: 8px;
            padding-bottom: 0;
          }

          #pager {
            margin-top: auto;
          }
      `,
    ];
  }
}
