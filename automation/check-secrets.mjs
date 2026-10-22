import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const skipped = new Set(["node_modules", ".next", ".git"]);
const secrets = [];
for (const name of ["backend/.env", "frontend/.env"]) {
  const content = await fs
    .readFile(path.join(root, name), "utf8")
    .catch(() => "");
  for (const line of content.split("\n")) {
    const match = line.match(
      /^([A-Z_]*(?:SECRET|PASSWORD|TOKEN|API_KEY|MONGO_URI)[A-Z_]*)=(.+)$/,
    );
    if (match && match[2].length >= 8)
      secrets.push(match[2].replace(/^['"]|['"]$/g, ""));
  }
}
const failures = [];
async function scan(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (skipped.has(entry.name)) continue;
    const target = path.join(dir, entry.name);
    const relative = path.relative(root, target);
    if (entry.isDirectory()) {
      await scan(target);
      continue;
    }
    if (
      !entry.isFile() ||
      (/^\.env/.test(entry.name) && entry.name !== ".env.example")
    )
      continue;
    if (
      /\.(pem|key|p12|pfx|dump|bak)$/i.test(entry.name) ||
      /^(credentials|service-account).*\.json$/i.test(entry.name)
    ) {
      failures.push(relative);
      continue;
    }
    const content = await fs.readFile(target, "utf8");
    if (
      secrets.some((value) => content.includes(value)) ||
      /mongodb(?:\+srv)?:\/\/[^\s/:]+:[^\s@]+@|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|AIza[\w-]{35}|gh[pousr]_[A-Za-z0-9]{30,}/.test(
        content,
      )
    )
      failures.push(relative);
  }
}
await scan(root);
if (failures.length) {
  console.error(
    "Potential secrets found in these files (values hidden):\n" +
      [...new Set(failures)].join("\n"),
  );
  process.exitCode = 1;
} else
  console.log(
    "Secret check passed: no known credentials or private key files found outside local environment files.",
  );
