const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_ORIGIN = "https://team.cquqianli.cn";
const errors = [];
const seenTitles = new Map();
const seenDescriptions = new Map();
const canonicalUrls = new Set();
const seenCanonicalUrls = new Map();

function walkHtml(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".github", ".idea", "poster-official-launch"].includes(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(absolute, result);
    else if (entry.name.endsWith(".html")) result.push(absolute);
  }
  return result;
}

function remember(map, value, relative, label) {
  if (!value) return errors.push(`${relative}: missing ${label}`);
  if (map.has(value)) errors.push(`${relative}: duplicate ${label} also used by ${map.get(value)}`);
  else map.set(value, relative);
}

for (const file of walkHtml(ROOT)) {
  const relative = path.relative(ROOT, file).split(path.sep).join("/");
  const html = fs.readFileSync(file, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
  const noindex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);
  remember(seenTitles, title, relative, "title");
  remember(seenDescriptions, description, relative, "description");

  if (!noindex) {
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    if (!canonical?.startsWith(`${SITE_ORIGIN}/`)) errors.push(`${relative}: missing or invalid canonical`);
    else if (seenCanonicalUrls.has(canonical)) errors.push(`${relative}: duplicate canonical also used by ${seenCanonicalUrls.get(canonical)}`);
    else {
      canonicalUrls.add(canonical);
      seenCanonicalUrls.set(canonical, relative);
    }
    for (const marker of ["og:title", "og:description", "og:url", "og:image", "twitter:card", "application/ld+json"]) {
      if (!html.includes(marker)) errors.push(`${relative}: missing ${marker}`);
    }
    for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
      try {
        JSON.parse(match[1]);
      } catch {
        errors.push(`${relative}: invalid JSON-LD`);
      }
    }
  }
}

const sitemapPath = path.join(ROOT, "sitemap.xml");
const robotsPath = path.join(ROOT, "robots.txt");
if (!fs.existsSync(sitemapPath)) errors.push("missing sitemap.xml");
if (!fs.existsSync(robotsPath)) errors.push("missing robots.txt");

if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
  for (const url of canonicalUrls) if (!sitemapUrls.has(url)) errors.push(`sitemap missing ${url}`);
  for (const url of sitemapUrls) if (!canonicalUrls.has(url)) errors.push(`sitemap has non-canonical URL ${url}`);
}

if (fs.existsSync(robotsPath) && !fs.readFileSync(robotsPath, "utf8").includes(`${SITE_ORIGIN}/sitemap.xml`)) {
  errors.push("robots.txt does not advertise sitemap.xml");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`SEO check passed: ${canonicalUrls.size} indexable pages have unique metadata and canonical URLs.`);
