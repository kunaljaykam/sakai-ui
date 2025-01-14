import { LitElement } from "lit";
import { loadProperties, tr } from "@sakai-ui/sui-i18n";

export class SuiElement extends LitElement {

  /**
   * Convenience wrapper for sakai-18n.tr.
   *
   * Example:
   *
   * confirm_coolness=This is {} cool
   * let translated = mySuiElementSubclass.tr("confirm_coolness", ["really"]);
   *
   * @param {string} key The i18n key we want to translate
   * @params {(string[]|Object)} options This can either be an array of replacement strings, or an object
   * which contains token names to values, as well as options like debug: true.
   * @param {boolean} [forceBundle=this.bundle] The bundle to use in preference to this.bundle
   */
  tr(key, options, forceBundle) {
    return tr(forceBundle || this.bundle, key, options);
  }

  createRenderRoot() {

    // Render to the real dom, not the shadow. We can now pull
    // in Sakai's css and js. This makes any this, and any subclasses,
    // custom elements, not full blown web components
    return this;
  }

  loadTranslations(options) {

    if (typeof options === "string") {
      this.bundle = options;
    } else {
      this.bundle = options.bundle;
    }

    // Pass the call on to the imported function
    return loadProperties(options);
  }

  setSetting(component, name, value) {

    const currentString = localStorage.getItem(`${component}-settings`);
    const settings = currentString ? JSON.parse(currentString) : {};
    settings[name] = value;
    localStorage.setItem(`${component}-settings`, JSON.stringify(settings));
  }

  getSetting(component, name) {

    const currentString = localStorage.getItem(`${component}-settings`);
    return !currentString ? null : JSON.parse(currentString)[name];
  }
}
