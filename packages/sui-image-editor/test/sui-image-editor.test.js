import "../sui-image-editor.js";
import { html } from "lit";
import * as data from "./data.js";
import { expect, fixture, aTimeout, waitUntil } from "@open-wc/testing";

describe("sui-image-editor tests", () => {

  beforeEach(() =>  {

    window.top.portal = { locale: "en_GB" };

    window.fetch = url => {

      if (url === data.i18nUrl) {
        return Promise.resolve({ text: () => Promise.resolve(data.i18n) });
      } else if (url === data.dialogcontentI18nUrl) {
        return Promise.resolve({ text: () => Promise.resolve(data.dialogcontentI18n) });
      } else {
        console.error(`Miss on ${url}`);
        return Promise.reject();
      }
    };
  });

  it ("renders correctly", async () => {

    let el = await fixture(html`
      <sui-image-editor image-url="/test/images/orville.jpeg"></sui-image-editor>
    `);

    await el.updateComplete;

    expect(el.shadowRoot.getElementById("image")).to.exist;
  });

  it ("is accessible", async () => {

    let el = await fixture(html`
      <sui-image-editor></sui-image-editor>
    `);

    expect(el).to.be.accessible();
  });
});
