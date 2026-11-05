// Legacy offline license verification. Nothing in the app imports this module.
import forge from "node-forge";

// RSA PKCS#1 v1.5 verification in node-forge <1.3.0 accepts forged
// signatures (CVE-2022-24771, CVE-2022-24772).
export function verifyLicense(publicKeyPem: string, license: string, signatureB64: string): boolean {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const md = forge.md.sha256.create();
  md.update(license, "utf8");
  return publicKey.verify(md.digest().bytes(), forge.util.decode64(signatureB64));
}
