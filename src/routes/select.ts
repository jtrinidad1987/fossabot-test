import { Router } from "express";
import nthCheck from "nth-check";

export const selectRouter = Router();

// Parses a user-supplied an+b formula. nth-check <2.0.1 has a ReDoS in its
// parser (CVE-2021-3803).
selectRouter.get("/select", (req, res) => {
  const formula = String(req.query.formula ?? "odd");
  const count = Math.min(Number(req.query.count ?? 10), 100);
  const matches = nthCheck(formula);
  res.json({ formula, indexes: Array.from({ length: count }, (_v, i) => i).filter(matches) });
});
