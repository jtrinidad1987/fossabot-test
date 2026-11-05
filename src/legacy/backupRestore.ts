// Legacy backup restore tool. Nothing in the app imports this module.
import * as tar from "tar";

// Extracting untrusted archives with tar <6.1.9 allows arbitrary file
// creation/overwrite via path traversal and symlinks (CVE-2021-32803, CVE-2021-37701, ...).
export async function restoreBackup(archivePath: string, targetDir: string): Promise<void> {
  await tar.x({ file: archivePath, cwd: targetDir });
}
