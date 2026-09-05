const fs = require("fs");
const path = require("path");
const vm = require("vm");

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
  const baseHref = baseMatch?.[1] || "";
  const baseDir = baseMatch
    ? baseHref.startsWith("/")
      ? path.resolve(root, baseHref.replace(/^[/\\]+/, ""))
      : path.resolve(path.dirname(file), baseHref)
    : path.dirname(file);
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

const articleDataPath = path.join(root, "assets", "js", "data", "qianli-articles.js");
if (fs.existsSync(articleDataPath)) {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(articleDataPath, "utf8"), context, { filename: articleDataPath });
  const articleData = context.window.QIANLI_ARTICLES;
  const seenSlugs = new Set();
  const seenUrls = new Set();

  if (!articleData || !Array.isArray(articleData.categories) || !Array.isArray(articleData.items)) {
    failures.push("assets/js/data/qianli-articles.js -> invalid article collection");
  } else {
    for (const article of articleData.items) {
      const label = article.slug || article.title || "unnamed article";
      for (const field of ["slug", "url", "category", "title", "summary", "author", "readingTime"]) {
        if (!article[field]) failures.push(`assets/js/data/qianli-articles.js -> ${label} missing ${field}`);
      }
      if (seenSlugs.has(article.slug)) failures.push(`assets/js/data/qianli-articles.js -> duplicate slug ${article.slug}`);
      if (seenUrls.has(article.url)) failures.push(`assets/js/data/qianli-articles.js -> duplicate url ${article.url}`);
      seenSlugs.add(article.slug);
      seenUrls.add(article.url);
      if (!articleData.categories.includes(article.category)) {
        failures.push(`assets/js/data/qianli-articles.js -> ${label} uses unknown category ${article.category}`);
      }
      const articlePath = path.join(root, article.url || "");
      if (!article.url || !fs.existsSync(articlePath)) {
        failures.push(`assets/js/data/qianli-articles.js -> ${label} page not found at ${article.url || "(missing url)"}`);
      } else if (article.title && !fs.readFileSync(articlePath, "utf8").includes(article.title)) {
        failures.push(`assets/js/data/qianli-articles.js -> ${label} title not found in article page`);
      }
    }
  }
}

if (failures.length) {
  console.error(`Broken local references (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML pages: all local references resolve.`);
