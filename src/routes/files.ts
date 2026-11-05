import { Router } from "express";

export const filesRouter = Router();

// Two parameters in one path segment produce a backtracking regex in
// path-to-regexp <0.1.13 (CVE-2024-45296 / CVE-2024-52798), pulled in by express.
filesRouter.get("/files/:name-:ext", (req, res) => {
  res.json({ name: req.params.name, ext: req.params.ext });
});

// Extended urlencoded parsing goes through qs / body-parser.
filesRouter.post("/files/search", (req, res) => {
  res.json({ query: req.body });
});
