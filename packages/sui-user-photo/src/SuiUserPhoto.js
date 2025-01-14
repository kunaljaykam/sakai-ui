import { SuiElement } from "@sakai-ui/sui-element";
import { html } from "lit";
import { ifDefined } from "lit-html/directives/if-defined.js";

/**
 * A simple wrapper for Sakai's user profile picture.
 *
 * Usage:
 * <sui-user-photo user-id="adrian">
 *
 * @element sui-user-photo
 * @property {string} user-id - A Sakai user id
 * @property {string} [classes] - Extra classes to style the content
 * @property {string} [profile-popup] By default, profile popups are off. Set this to "on" if you want them
 * @property {boolean} [official] Set this if you want the official Sakai photo
 * @property {string} [site-id] Set this to trigger permissions checks on the photo
 * @property {string} [label] This will be used as the title and aria-label for the div
 * @property {boolean} [print] Set this to trigger the render of a print friendly img tag
 */
export class SuiUserPhoto extends SuiElement {

  constructor() {

    super();

    this.classes = "large-thumbnail";
    this.profilePopup = SuiUserPhoto.OFF;
  }

  static get properties() {

    return {
      userId: { attribute: "user-id", type: String },
      classes: { type: String },
      profilePopup: { attribute: "profile-popup", type: String },
      official: { type: Boolean },
      siteId: { attribute: "site-id", type: String },
      label: { type: String },
      print: { type: Boolean },
      online: { type: Boolean },
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {

    super.attributeChangedCallback(name, oldValue, newValue);

    if (this.userId) {
      this.generatedId = `sui-user-photo-${this.userId}-${Math.floor(Math.random() * 100)}`;

      this.url = `/direct/profile/${this.userId}/image/${this.official ? "official" : "thumb"}`
                  + (this.siteId ? `?siteId=${this.siteId}` : "");
    }

    if (this.profilePopup == SuiUserPhoto.ON && this.generatedId) {
      this.updateComplete.then(() => {
        profile.attachPopups(document.getElementById(this.generatedId));
      });
    }
  }

  shouldUpdate() {
    return this.userId;
  }

  render() {

    if (this.print) {
      return html`
        <img src="${this.url}" alt="${ifDefined(this.label ? this.label : undefined)}" />
      `;
    }

    return html`
      <div id="${this.generatedId}"
          data-user-id="${this.userId}"
          class="sui-user-photo ${this.classes}"
          aria-label="${ifDefined(this.label ? this.label : undefined)}"
          title="${ifDefined(this.label ? this.label : undefined)}"
          style="background-image:url(${this.url}) ${this.profilePopup === SuiUserPhoto.OFF ? "" : ";cursor: pointer;"}">
        ${this.online ? html`
        <span></span>
        ` : ""}
      </div>
    `;
  }
}

SuiUserPhoto.OFF = "off";
SuiUserPhoto.ON = "on";
