import { loadProperties, tr } from '../src/sui-i18n.js';
import { expect } from '@open-wc/testing';
import { stub } from "sinon";

describe("sui-i18n tests", () => {

  const value = "nog{0}";
  const testUrl = "/sakai-ws/rest/i18n/getI18nProperties?locale=en_GB&resourceclass=org.sakaiproject.i18n.InternationalizedMessages&resourcebundle=test";

  beforeEach(() => {

    window.fetch = url => {

      if (url === testUrl) {
        return Promise.resolve({ text: () => Promise.resolve(`egg=${value}`)});
      } else {
        throw new Error("No bundle found");
      }
    };

    window.top.portal = { locale: 'en_GB' };
  });

  it ("loads properties successfully", async () => {

    let i18n = await loadProperties('test');
    expect(i18n.egg).to.equal(value);

    i18n = await loadProperties('test');
    expect(i18n.egg).to.equal(value);
  });

  it ("translates", async () => {

    const i18n = await loadProperties('test');
    expect(tr('test', 'egg')).to.equal(value);
  });

  it ("translates with a replacements object", async () => {

    const i18n = await loadProperties('test');
    expect(tr('test', 'egg', { "0": "gin" })).to.equal('noggin');
  });

  it ("translates with an array", async () => {

    const prefix = "Ogg on";

    window.fetch = url => {

      if (url === testUrl) {
        return Promise.resolve({ text: () => Promise.resolve(`egg=${prefix} {} {}`)});
      } else {
        throw new Error("No bundle found");
      }
    };

    const i18n = await loadProperties({ bundle: 'test', cache: false });
    expect(tr('test', 'egg', ["the", "bog"])).to.equal(`${prefix} the bog`);
  });

  it ("logs an error when no bundle is supplied", async () => {

    const prefix = "Ogg on";

    const errorStub = stub(console, "error");
    let i18n = await loadProperties({});
    expect(errorStub).to.have.been.calledWith("You must supply at least a bundle. Doing nothing ...");

    let value = await tr();
    expect(errorStub).to.have.been.calledWith("You must supply a namespace and a key. Doing nothing.");

    window.sakai = { translations: {} };
    const warnStub = stub(console, "warn");
    value = tr("fake", "thing");
    expect(warnStub).to.have.been.calledWith("No namespace for fake. Returning key ...");
    expect(value).to.be.equal("thing");

    window.sakai.translations.fake = {};
    value = tr("fake", "thing");
    expect(warnStub).to.have.been.calledWith("fake#key thing not found. Returning key ...");
    expect(value).to.be.equal("thing");
  });

  it ("caches", async () => {

    // This call should cache in sessionStorage
    let i18n = await loadProperties('test');
    expect(i18n.egg).to.equal(value);

    // Now override fetch to return a different result.
    window.fetch = url => {

      if (url === testUrl) {
        return Promise.resolve({ text: () => Promise.resolve('egg=bacon')});
      } else {
        throw new Error("No bundle found");
      }
    };

    // This should return from sessionStorage, not fetching at all.
    i18n = await loadProperties('test');
    expect(i18n.egg).to.equal(value);

    // Clear out sessionStorage and the existing promises object
    window.sessionStorage.removeItem("en_GBtest");
    if (window?.sakai?.translations?.existingPromises) {
      window.sakai.translations.existingPromises = {};
    }

    // This call should now fetch
    i18n = await loadProperties('test');
    expect(i18n.egg).to.equal('bacon');
  });
});
