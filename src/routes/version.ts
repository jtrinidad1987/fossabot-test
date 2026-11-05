import { Router } from "express";
import semver from "semver";

// The range is a constant. CVE-2022-25883 is a ReDoS in Range parsing of
// untrusted range strings; user input is only ever treated as a version.
const SUPPORTED_CLIENTS = ">=1.4.0 <3.0.0";

export const versionRouter = Router();

versionRouter.get("/client-check/:version", (req, res) => {
  const version = semver.valid(req.params.version);
  if (!version) {
    res.status(400).json({ error: "invalid version" });
    return;
  }
  res.json({ version, supported: semver.satisfies(version, SUPPORTED_CLIENTS) });
});
