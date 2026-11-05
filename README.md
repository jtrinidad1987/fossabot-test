# fossabot-test

A small Express + TypeScript API that uses **outdated dependencies with known vulnerabilities on purpose**. It exists to test automated dependency remediation (for example, FOSSA / fossabot fix PRs).

> ⚠️ Do not deploy this. The dependencies are vulnerable on purpose.

## Run

```bash
npm install
npm run build
npm start            # or: node dist/index.js --port 4000
```

Config is read from `config/app.yaml` (override with `--config <path>`).

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/` | Health check |
| POST | `/token` | `{"user": "..."}` → signed JWT |
| GET | `/me` | Requires `Authorization: Bearer <token>` |
| GET | `/client-check/:version` | Checks a client version against a supported range |
| POST | `/render` | `{"template": "...", "data": {...}}` → rendered Handlebars HTML |
| GET | `/select?formula=2n+1&count=10` | Indexes matching an `an+b` formula |
| POST | `/upload` | Multipart `file` upload |
| GET | `/files/:name-:ext` | Echoes the parsed path params |
| POST | `/files/search` | Echoes a urlencoded body |
| GET | `/hash/:value` | SHA-256 of the value |
| WS | `/ws` | Echo server |

## Reachability scenarios

Each vulnerable package belongs to exactly one scenario. Use this as the expected result when you evaluate reachability analysis.

### Not reachable

The vulnerable function is never called on any live code path.

| Package | Where | Why it isn't reachable |
|---|---|---|
| `tar` | `src/legacy/backupRestore.ts` | `tar.x` (path traversal on extract) is in a module nothing imports |
| `node-forge` | `src/legacy/licenseVerifier.ts`, `src/routes/hash.ts` | RSA `publicKey.verify` (signature forgery) is in a module nothing imports. The live code only uses `md.sha256` |
| `passport` | `src/index.ts` | Only `passport.initialize()` is called. No sessions, and no `req.login`/`req.logout` (session fixation) |

### Reachable

The vulnerable function runs on a live path, but its input comes from deployment-controlled sources (a config file on disk), not from requests. Whether it can be exploited depends on how the app is deployed.

| Package | Where | Path |
|---|---|---|
| `yaml` | `src/config.ts` | `YAML.parse` on `config/app.yaml` at every startup |
| `lodash` | `src/notifications.ts` | `_.template` with template source and `variable` option taken from config (CVE-2021-23337). Used at startup and on `GET /me` |

### Reachable and exploitable

Input from the request flows straight to the vulnerable code.

| Package | Where | Path |
|---|---|---|
| `handlebars` | `src/routes/render.ts` | `Handlebars.compile` on `req.body.template` → JS injection / RCE |
| `nth-check` | `src/routes/select.ts` | `nthCheck(req.query.formula)` → ReDoS (CVE-2021-3803) |
| `multer` | `src/routes/upload.ts` | Public `upload.single()` with no limits → multipart DoS |
| `ws` | `src/ws.ts` | Public `WebSocketServer` with default limits → header/fragment DoS (CVE-2024-37890) |
| `express` (`path-to-regexp`, `qs`, `body-parser`) | `src/routes/files.ts`, `src/index.ts` | `/files/:name-:ext` route → ReDoS. `express.urlencoded({ extended: true })` / `express.json()` on public routes → `qs`/`body-parser` DoS |

### Reachable but not exploitable

The vulnerable function runs on a live path, but the vulnerable condition can't be met.

| Package | Where | Why it isn't exploitable |
|---|---|---|
| `jsonwebtoken` | `src/auth.ts` | `jwt.verify` runs on every `/me` request, but with `algorithms: ["HS256"]` (CVE-2022-23540), a strong symmetric secret rather than an asymmetric/legacy key (CVE-2022-23539), and no key callback (CVE-2022-23541) |
| `semver` | `src/routes/version.ts` | `semver.satisfies` runs on user input, but the ReDoS (CVE-2022-25883) is in Range parsing. The range is a constant, and user input is only parsed as a version |
| `minimist` | `src/config.ts` | Parses `process.argv` only, which the operator controls, not remote users (prototype pollution, CVE-2021-44906) |

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
