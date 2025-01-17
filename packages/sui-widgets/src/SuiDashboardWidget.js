import { css, html, LitElement } from "lit";
import "@sakai-ui/sui-icon";
import { loadProperties } from "@sakai-ui/sui-i18n";
import "@sakai-ui/sui-pager";

export class SuiDashboardWidget extends LitElement {

  constructor() {

    super();

    this.title = "Widget";
    this.state = "view";
    this.editing = false;
    this.hasOptions = true;
    loadProperties("dashboard-widget").then(r => this.baseI18n = r);
  }

  static get properties() {

    return {
      siteId: { attribute: "site-id", type: String },
      userId: { attribute: "user-id", type: String },
      title: String,
      state: String,
      baseI18n: Object,
      i18n: Object,
      editing: { type: Boolean },
    };
  }

  set widgetId(value) {

    this._widgetId = value;
    loadProperties(value).then(r => this.title = r.widget_title);
  }

  get widgetId() { return this._widgetId; }

  loadTranslations(options) {

    const p = loadProperties(options);
    p.then(r => {

      this.i18n = r;
      this.title = r.widget_title;
    });
    return p;
  }

  content() {}

  remove() {
    this.dispatchEvent(new CustomEvent("remove", { bubbles: true }));
  }

  shouldUpdate() {
    return this.baseI18n && this.title;
  }

  move(direction) {
    this.dispatchEvent(new CustomEvent("move", { detail: { widgetId: this.widgetId, direction }, bubbles: true }));
  }

  moveUp() {
    this.move("up");
  }

  moveDown() {
    this.move("down");
  }

  moveLeft() {
    this.move("left");
  }

  moveRight() {
    this.move("right");
  }

  render() {

    return html`
      <div id="container">
        <div id="title-bar">
          <div id="title">${this.title}</div>
          ${this.editing ? html`
            <div id="widget-mover">
              <div>
                <a href="javascript:;"
                    @click=${this.moveUp}
                    title="${this.baseI18n.up}"
                    arial-label="${this.baseI18n.up}">
                  <sui-icon type="up" size="small"></sui-icon>
                </a>
              </div>
              <div>
                <a href="javascript:;"
                    @click=${this.moveDown}
                    title="${this.baseI18n.down}"
                    arial-label="${this.baseI18n.down}">
                  <sui-icon type="down" size="small"></sui-icon>
                </a>
              </div>
              <div>
                <a href="javascript:;"
                    @click=${this.moveLeft}
                    title="${this.baseI18n.left}"
                    arial-label="${this.baseI18n.left}">
                  <sui-icon type="left" size="small"></sui-icon>
                </a>
              </div>
              <div>
                <a href="javascript:;"
                    @click=${this.moveRight}
                    title="${this.baseI18n.right}"
                    arial-label="${this.baseI18n.right}">
                  <sui-icon type="right" size="small"></sui-icon>
                </a>
              </div>
              <div>
                <a href="javascript:;"
                    @click=${this.remove}
                    title="${this.baseI18n.remove} ${this.title}"
                    aria-label="${this.baseI18n.remove} ${this.title}">
                  <sui-icon type="close" size="small"></sui-icon>
                </a>
              </div>
            </div>
          ` : ""}
        </div>
        <div id="content">${this.content()}</div>
        ${this.showPager ? html`
        <sui-pager count="${this.count}" current="1" @page-selected=${this.pageClicked}></sui-pager>
        ` : ""}

      </div>
    `;
  }

  static get styles() {

    return [
      css`

        :host {
          width: 100%;
        }
        a {
          color: var(--link-color);
        }
        a:hover { 
          color: var(--link-hover-color);
        }
        a:active {
          color: var(--link-active-color);
        }
        a:visited {
          color: var(--link-visited-color);
        }
        #topbar {
          display: flex;
          margin-top: 8px;
          margin-bottom: 20px;
        }

        #container {
          display: flex;
          flex-flow: column;
          height: 100%;
          background-color: var(--sui-dashboard-widget-bg-color, white);
          border-radius: var(--sui-course-card-border-radius, 4px);
          border: solid;
          border-width: var(--sui-dashboard-widget-border-width, 1px);
          border-color: var(--sui-dashboard-widget-border-color, rgb(224,224,224));
        }

        #title-bar {
          display: flex;
          padding: 10px;
          background-color: var(--sui-title-bar-bg-color, rgb(244, 244, 244));
          font-weight: var(--sui-title-bar-font-weight, bold);
        }

          #title-bar sui-icon[type="close"] {
            color: var(--sui-close-icon-color, red);
          }

          #title {
            flex: 2;
            margin-left: 12px;
          }
        #content {
          padding: 10px;
          padding-bottom: 0;
          flex-grow: 1;
          border-radius: 0 0 var(--sui-course-card-border-radius, 4px) var(--sui-course-card-border-radius, 4px);
        }

        #widget-mover {
          display: flex;
        }
          #widget-mover div {
            padding: 5px;
            flex: 1;
          }
      `,
    ];
  }
}
