import express from "express";
import http from "http";
import passport from "passport";
import { createAuth } from "./auth";
import { loadConfig } from "./config";
import { createWelcomeRenderer } from "./notifications";
import { filesRouter } from "./routes/files";
import { hashRouter } from "./routes/hash";
import { renderRouter } from "./routes/render";
import { selectRouter } from "./routes/select";
import { uploadRouter } from "./routes/upload";
import { versionRouter } from "./routes/version";
import { attachWebSocket } from "./ws";

const config = loadConfig();
const welcome = createWelcomeRenderer(config);
const auth = createAuth(config);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// passport is initialized, but the app has no sessions and never calls
// req.login / req.logout, where the session-fixation bug lives (CVE-2022-25896).
app.use(passport.initialize());

app.get("/", (_req, res) => {
  res.send(`${config.app.name} is running`);
});

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
});

app.post("/token", (req, res) => {
  const user = typeof req.body?.user === "string" ? req.body.user : "anonymous";
  res.json({ token: auth.issue(user) });
});

app.get("/me", auth.requireAuth, (_req, res) => {
  const sub = String(res.locals.user?.sub ?? "");
  res.json({ user: res.locals.user, message: welcome(sub) });
});

app.use(versionRouter);
app.use(renderRouter);
app.use(selectRouter);
app.use(uploadRouter);
app.use(filesRouter);
app.use(hashRouter);

const server = http.createServer(app);
attachWebSocket(server);

server.listen(config.app.port, () => {
  console.log(welcome("operator"));
  console.log(`${config.app.name} listening on http://localhost:${config.app.port}`);
});
