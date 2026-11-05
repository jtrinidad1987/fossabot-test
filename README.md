# fossabot-test

A small Express + TypeScript API that uses **outdated dependencies with known vulnerabilities on purpose**. It exists to test automated dependency remediation (for example, FOSSA / fossabot fix PRs).

> ⚠️ Do not deploy this. The dependencies are vulnerable on purpose.

## Run

```bash
npm install
npm run build
npm start            # or: node dist/index.js --port 4000
```

Endpoints: `GET /?name=`, `POST /token`, `GET /hash/:value`, `GET /semver/:version`, `GET /nth/:formula/:index`, `POST /config` (YAML body), `POST /upload` (multipart `file`), `GET /archive`, plus a WebSocket echo server on the same port.

## Vulnerable dependencies

Each package is pinned to an exact version. They are grouped by the smallest bump that clears **every** current npm advisory for that package (based on `npm audit` as of 2026-11-04).

### Patch updates

| Package | Current | Min fixed | Notes |
|---|---|---|---|
| `handlebars` | 4.7.8 | 4.7.10 | JS injection via AST type confusion, prototype pollution |
| `minimist` | 1.2.5 | 1.2.6 | Prototype pollution (CVE-2021-44906) |
| `semver` | 7.5.1 | 7.5.2 | ReDoS (CVE-2022-25883) |
| `yaml` | 2.8.2 | 2.8.3 | Stack overflow via deeply nested collections |

### Minor updates

| Package | Current | Min fixed | Notes |
|---|---|---|---|
| `express` | 4.21.2 | 4.22.3 | Fixes transitive `body-parser`, `path-to-regexp`, `qs` DoS issues |
| `lodash` | 4.17.20 | 4.18.0 | Command injection (CVE-2021-23337), ReDoS, `_.template` code injection, prototype pollution |
| `multer` | 2.0.0 | 2.5.0 | Multiple DoS issues |
| `ws` | 8.17.0 | 8.21.0 | DoS via many headers (CVE-2024-37890), memory disclosure, memory exhaustion |

### Major updates

| Package | Current | Min fixed | Notes |
|---|---|---|---|
| `jsonwebtoken` | 8.5.1 | 9.0.0 | CVE-2022-23539 / 23540 / 23541 |
| `node-forge` | 0.10.0 | 1.4.1 | Signature verification bypasses (CVE-2022-24771/24772), ASN.1 issues, and more |
| `nth-check` | 1.0.2 | 2.0.1 | ReDoS (CVE-2021-3803) |
| `passport` | 0.5.3 | 0.6.0 | Session fixation (CVE-2022-25896); 0.x minor = semver-major |
| `tar` | 6.1.0 | 7.5.21 | Arbitrary file overwrite / path traversal (CVE-2021-32803, 37701, …); no fixed 6.x release |
