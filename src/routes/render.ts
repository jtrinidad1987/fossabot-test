import { Router } from "express";
import Handlebars from "handlebars";

export const renderRouter = Router();

// Compiles a template supplied in the request body. Handlebars <4.7.10 allows
// JavaScript injection / RCE when compiling attacker-controlled templates.
renderRouter.post("/render", (req, res) => {
  const { template, data } = req.body ?? {};
  if (typeof template !== "string") {
    res.status(400).json({ error: "template is required" });
    return;
  }
  const html = Handlebars.compile(template)(data ?? {});
  res.type("html").send(html);
});
