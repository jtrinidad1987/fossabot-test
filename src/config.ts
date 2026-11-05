import fs from "fs";
import path from "path";
import minimist from "minimist";
import YAML from "yaml";

export interface AppConfig {
  app: { name: string; port: number };
  notifications: { welcomeTemplate: string; templateVariable: string };
  jwt: { issuer: string; expiresIn: string };
}

// minimist only ever sees process.argv, which is controlled by whoever
// launches the process, not by remote users.
const argv = minimist(process.argv.slice(2), {
  string: ["config"],
  default: { config: path.join(__dirname, "..", "config", "app.yaml") },
});

// yaml.parse runs on every startup against a file read from disk.
// Whether that is attacker-influenced depends on how the app is deployed.
export function loadConfig(): AppConfig {
  const raw = fs.readFileSync(String(argv.config), "utf8");
  const config = YAML.parse(raw) as AppConfig;
  if (argv.port !== undefined) config.app.port = Number(argv.port);
  return config;
}
