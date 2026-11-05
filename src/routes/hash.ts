import { Router } from "express";
import forge from "node-forge";

export const hashRouter = Router();

// Only node-forge's SHA-256 digest is used here. The vulnerable RSA
// signature, ASN.1, and TLS code paths are not called on any live route.
hashRouter.get("/hash/:value", (req, res) => {
  const md = forge.md.sha256.create();
  md.update(req.params.value, "utf8");
  res.json({ sha256: md.digest().toHex() });
});
