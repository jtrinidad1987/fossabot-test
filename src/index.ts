import express from "express";
import http from "http";
import Handlebars from "handlebars";
import jwt from "jsonwebtoken";
import _ from "lodash";
import minimist from "minimist";
import multer from "multer";
import forge from "node-forge";
import nthCheck from "nth-check";
import passport from "passport";
import semver from "semver";
import * as tar from "tar";
import { WebSocketServer } from "ws";
import YAML from "yaml";

const args = minimist(process.argv.slice(2));
const port = Number(args.port ?? process.env.PORT ?? 3000);
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(passport.initialize());

const greeting = Handlebars.compile("<h1>Hello, {{name}}!</h1>");

app.get("/", (req, res) => {
  res.send(greeting({ name: String(req.query.name ?? "world") }));
});

app.post("/token", (req, res) => {
  const user = _.pick(req.body, ["id", "name"]);
  res.json({ token: jwt.sign(user, JWT_SECRET, { expiresIn: "1h" }) });
});

app.get("/hash/:value", (req, res) => {
  const md = forge.md.sha256.create();
  md.update(req.params.value);
  res.json({ sha256: md.digest().toHex() });
});

app.get("/semver/:version", (req, res) => {
  const v = req.params.version;
  res.json({ valid: semver.valid(v) !== null, satisfies: semver.satisfies(v, ">=1.0.0") });
});

app.get("/nth/:formula/:index", (req, res) => {
  const check = nthCheck(req.params.formula);
  res.json({ matches: check(Number(req.params.index)) });
});

app.post("/config", express.text({ type: "*/*" }), (req, res) => {
  res.json(YAML.parse(String(req.body)));
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ received: req.file?.originalname ?? null, size: req.file?.size ?? 0 });
});

app.get("/archive", async (_req, res) => {
  res.setHeader("Content-Type", "application/gzip");
  tar.c({ gzip: true, cwd: process.cwd() }, ["package.json"]).pipe(res);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
wss.on("connection", (socket) => {
  socket.on("message", (data) => socket.send(`echo: ${data}`));
});

server.listen(port, () => {
  console.log(`fossabot-test listening on http://localhost:${port}`);
});
