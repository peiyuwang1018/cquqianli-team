const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if ([".git"].includes(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function checkReference(file, reference, baseDir) {
  if (!reference || /^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(reference)) return;
  const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
  if (!clean) return;
  let target = path.resolve(baseDir, clean);
  if (clean.endsWith("/")) target = path.join(target, "index.html");
  if (!fs.existsSync(target)) {
    failures.push(`${path.relative(root, file)} -> ${reference}`);
  }
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, "utf8");
  const baseMatch = content.match(/<base\s+href=["']([^"']+)["']/i);
  const baseDir = baseMatch ? path.resolve(path.dirname(file), baseMatch[1]) : path.dirname(file);
  const contentWithoutBase = content.replace(/<base\s+href=["'][^"']+["']\s*\/?>/i, "");
  for (const match of contentWithoutBase.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    checkReference(file, match[1], baseDir);
  }
}

for (const file of files.filter((item) => item.endsWith(".css"))) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) {
    checkReference(file, match[1], path.dirname(file));
  }
}

for (const file of files.filter((item) => item.endsWith(".js") && !/(?:check|restructure)-site\.js$/.test(item))) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/["'](assets\/(?:images|fonts)\/[^"']+)["']/g)) {
    checkReference(file, match[1], root);
  }
}

if (failures.length) {
  console.error(`Broken local references (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML pages: all local references resolve.`);
