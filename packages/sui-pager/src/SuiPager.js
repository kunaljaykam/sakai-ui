import { css } from "lit";
import { loadProperties } from "@sakai-ui/sui-i18n";
import { LionPagination } from "@lion/pagination";

/**
 * @customElement sui-pager
**/
export class SuiPager extends LionPagination {

  constructor() {

    super();

    this.addEventListener("current-changed", (e) => {

      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("page-selected", { detail: { page: this.current }, bubbles: true }));
    });

    loadProperties("pager").then(t => { this.i18n = t; this.requestUpdate(); });
  }

  static get styles() {

    return [
      ...super.styles,
      css`
      `,
    ];
  }
}
