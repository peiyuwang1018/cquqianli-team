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

  if (
    !articleData
    || articleData.schemaVersion !== 2
    || !Array.isArray(articleData.categories)
    || !Array.isArray(articleData.departments)
    || !Array.isArray(articleData.series)
    || !Array.isArray(articleData.items)
  ) {
    failures.push("assets/js/data/qianli-articles.js -> invalid article collection");
  } else {
    const buildTaxonomyMap = (name, entries, requiredFields = []) => {
      const map = new Map();
      const labels = new Set();
      for (const entry of entries) {
        const label = entry?.id || `unnamed ${name}`;
        for (const field of ["id", "label", ...requiredFields]) {
          if (!entry?.[field]) failures.push(`assets/js/data/qianli-articles.js -> ${label} missing ${name}.${field}`);
        }
        if (map.has(entry?.id)) failures.push(`assets/js/data/qianli-articles.js -> duplicate ${name} id ${entry?.id}`);
        if (labels.has(entry?.label)) failures.push(`assets/js/data/qianli-articles.js -> duplicate ${name} label ${entry?.label}`);
        map.set(entry?.id, entry);
        labels.add(entry?.label);
      }
      return map;
    };

    const categoryMap = buildTaxonomyMap("category", articleData.categories, ["description"]);
    const departmentMap = buildTaxonomyMap("department", articleData.departments, ["tone"]);
    const seriesMap = buildTaxonomyMap("series", articleData.series, ["description"]);

    for (const series of articleData.series) {
      if (!Array.isArray(series.departments) || series.departments.length === 0) {
        failures.push(`assets/js/data/qianli-articles.js -> ${series.id || "unnamed series"} missing series.departments`);
        continue;
      }
      for (const department of series.departments) {
        if (!departmentMap.has(department)) {
          failures.push(`assets/js/data/qianli-articles.js -> ${series.id} uses unknown department ${department}`);
        }
      }
    }

    for (const article of articleData.items) {
      const label = article.slug || article.title || "unnamed article";
      const comingSoon = article.status === "coming-soon";
      if (article.status && article.status !== "coming-soon") {
        failures.push(`assets/js/data/qianli-articles.js -> ${label} uses unknown status ${article.status}`);
      }
      const requiredFields = comingSoon
        ? ["slug", "category", "eyebrow", "title", "summary", "author", "cover", "coverAlt"]
        : ["slug", "url", "category", "eyebrow", "title", "summary", "author", "publishedDate", "readingTime", "cover", "coverAlt"];
      for (const field of requiredFields) {
        if (!article[field]) failures.push(`assets/js/data/qianli-articles.js -> ${label} missing ${field}`);
      }
      if (article.publishedDate && !/^\d{4}-\d{2}-\d{2}$/.test(article.publishedDate)) {
        failures.push(`assets/js/data/qianli-articles.js -> ${label} publishedDate must use YYYY-MM-DD`);
      }
      if (!Object.prototype.hasOwnProperty.call(article, "series")) {
        failures.push(`assets/js/data/qianli-articles.js -> ${label} missing series (use null for a non-series article)`);
      }
      if (seenSlugs.has(article.slug)) failures.push(`assets/js/data/qianli-articles.js -> duplicate slug ${article.slug}`);
      if (article.url && seenUrls.has(article.url)) failures.push(`assets/js/data/qianli-articles.js -> duplicate url ${article.url}`);
      seenSlugs.add(article.slug);
      if (article.url) seenUrls.add(article.url);
      if (!categoryMap.has(article.category)) {
        failures.push(`assets/js/data/qianli-articles.js -> ${label} uses unknown category ${article.category}`);
      }
      if (!Array.isArray(article.departments) || article.departments.length === 0) {
        failures.push(`assets/js/data/qianli-articles.js -> ${label} must declare at least one department`);
      } else {
        const uniqueDepartments = new Set(article.departments);
        if (uniqueDepartments.size !== article.departments.length) {
          failures.push(`assets/js/data/qianli-articles.js -> ${label} has duplicate departments`);
        }
        for (const department of article.departments) {
          if (!departmentMap.has(department)) {
            failures.push(`assets/js/data/qianli-articles.js -> ${label} uses unknown department ${department}`);
          }
        }
      }
      if (article.series !== null && !seriesMap.has(article.series)) {
        failures.push(`assets/js/data/qianli-articles.js -> ${label} uses unknown series ${article.series}`);
      } else if (article.series) {
        const seriesDepartments = seriesMap.get(article.series).departments || [];
        const articleDepartments = Array.isArray(article.departments) ? article.departments : [];
        const missingDepartments = seriesDepartments.filter((department) => !articleDepartments.includes(department));
        if (missingDepartments.length) {
          failures.push(`assets/js/data/qianli-articles.js -> ${label} must include ${missingDepartments.join(", ")} for series ${article.series}`);
        }
      }
      if (!Array.isArray(article.tags) || article.tags.length === 0) {
        failures.push(`assets/js/data/qianli-articles.js -> ${label} must declare at least one tag`);
      } else {
        const uniqueTags = new Set();
        for (const tag of article.tags) {
          if (typeof tag !== "string" || !tag.trim()) {
            failures.push(`assets/js/data/qianli-articles.js -> ${label} has an invalid tag`);
            continue;
          }
          if (tag.startsWith("#")) failures.push(`assets/js/data/qianli-articles.js -> ${label} tag ${tag} must omit the # prefix`);
          if (uniqueTags.has(tag)) failures.push(`assets/js/data/qianli-articles.js -> ${label} has duplicate tag ${tag}`);
          uniqueTags.add(tag);
        }
      }
      if (!comingSoon) {
        const articlePath = path.join(root, article.url || "");
        if (!article.url || !fs.existsSync(articlePath)) {
          failures.push(`assets/js/data/qianli-articles.js -> ${label} page not found at ${article.url || "(missing url)"}`);
        } else if (article.title && !fs.readFileSync(articlePath, "utf8").includes(article.title)) {
          failures.push(`assets/js/data/qianli-articles.js -> ${label} title not found in article page`);
        }
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
