import _ from "lodash";
import type { AppConfig } from "./config";

// Both the template source and the `variable` option come from the config
// file (see CVE-2021-23337: command injection via the `variable` option).
// Request data is passed in only as template data, escaped.
export function createWelcomeRenderer(config: AppConfig) {
  const render = _.template(config.notifications.welcomeTemplate, {
    variable: config.notifications.templateVariable,
  });
  return (user: string): string => render({ appName: config.app.name, user: _.escape(user) });
}
