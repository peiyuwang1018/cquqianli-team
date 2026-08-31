const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_ORIGIN = "https://team.cquqianli.cn";
const DEFAULT_DESCRIPTION = "重庆大学千里战队队伍主页，展示战队介绍、技术组别、责任组别、队史档案、招新信息与联系方式。";
const SOCIAL_IMAGE = `${SITE_ORIGIN}/assets/images/brand/%E6%88%90%E4%B8%BA%E6%88%91%E4%BB%AC%E7%9A%84%E4%B8%8B%E4%B8%80%E4%B8%AA%E6%9C%AA%E6%9D%A5.png`;
const MANAGED_START = "<!-- SEO: managed by scripts/build-seo.js -->";
const MANAGED_END = "<!-- /SEO -->";

const descriptionOverrides = {
  "index.html": "重庆大学千里战队是重庆大学 RoboMaster 机甲大师机器人战队，开展机械设计、电气控制、视觉算法、硬件开发、宣传运营与赛季机器人研发。",
  "about/index.html": "了解重庆大学千里战队的队伍定位、技术方向、赛季研发、团队协作与人才培养，认识这支 RoboMaster 机器人战队。",
  "about/culture.html": "了解重庆大学千里战队的团队精神、工程文化、协作方式与共同记忆，以及队员如何在赛季中共同成长。",
  "about/history.html": "回顾重庆大学千里战队自 2016 年成立以来的队名演变、赛季征程、比赛成绩与重要发展节点。",
  "about/management.html": "了解重庆大学千里战队的规章制度、项目管理、SOP、知识传承、同伴支持与跨组协作方式。",
  "groups/position-members.html": "了解重庆大学千里战队正式队员的赛季职责、项目协作、技术成长与队伍贡献方式。",
  "groups/position-trainees.html": "了解重庆大学千里战队梯队队员的培养阶段、学习任务、项目实践与转正成长路径。",
  "groups/responsibility-management.html": "了解重庆大学千里战队管理层在赛季目标、项目统筹、资源协调、团队建设与风险管理中的职责。",
  "groups/responsibility.html": "了解重庆大学千里战队的管理、竞技战术与基建效率等责任组别，以及它们如何支持赛季研发和比赛执行。",
  "groups/vision.html": "了解重庆大学千里战队视觉算法组的目标识别、自动瞄准、定位导航、感知决策与机器人算法研发方向。",
  "join/index.html": "重庆大学千里战队纳新通道，查看 2027 秋季招新时间、报名方式、技术组岗位、招新群与投递须知。",
  "museum/hall-of-fame.html": "重庆大学千里战队名人堂，展示历届队员代表、赛季贡献、成长经历与人才发展去向。",
  "museum/index.html": "进入重庆大学千里战队博物馆，查看队史档案、比赛荣誉、团队项目、照片影像、公开资料与成员故事。",
  "museum/memes.html": "重庆大学千里战队梗指南，收录赛季研发、比赛现场与队伍日常中留下的内部典故和共同记忆。",
  "museum/records.html": "重庆大学千里战队历史比赛档案，按赛季整理 RoboMaster 赛事经历、参赛记录与比赛资料。",
  "museum/shop.html": "重庆大学千里战队周边橱窗，展示文化衫、徽章、服装、文创与队伍视觉设计作品。",
  "museum/stories.html": "重庆大学千里战队故事会，记录队员与校友亲历的研发、比赛、协作、成长和赛季记忆。",
  "museum/training/control.html": "重庆大学千里战队电气控制组公开课程，介绍嵌入式控制、开发工具、基础知识与学习路径。",
  "museum/training/hardware.html": "重庆大学千里战队硬件开发组公开先导课，介绍焊接调试、嵌入式基础、原理图、PCB 设计与板卡交付路径。",
  "museum/training/mechanical.html": "重庆大学千里战队机械结构组培训体系，包含基础课程、操作实训、梯队考核、进阶培训、研发实习与梯队结业考试。",
  "museum/training/vision.html": "重庆大学千里战队视觉算法组公开课程，介绍计算机视觉、算法工具、基础知识与学习路径。",
};

const titleOverrides = {
  "index.html": "重庆大学千里战队 | RoboMaster 机甲大师机器人战队",
};

const sectionParents = {
  about: ["关于千里", "about/index.html"],
  contact: ["合作招商", "contact/index.html"],
  groups: ["团队架构", "about/organization.html"],
  join: ["纳新通道", "join/index.html"],
  museum: ["千里博物馆", "museum/index.html"],
  season: ["赛季一线", "season/index.html"],
};

function htmlEscape(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function htmlDecode(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripTags(value) {
  return htmlDecode(value.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

function walkHtml(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".github", ".idea", "poster-official-launch"].includes(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(absolute, result);
    else if (entry.name.endsWith(".html")) result.push(absolute);
  }
  return result;
}

function canonicalPath(relative) {
  return relative === "index.html" ? "/" : `/${relative}`;
}

function breadcrumbData(relative, pageName, canonicalUrl) {
  const parts = relative.split("/");
  const items = [{ "@type": "ListItem", position: 1, name: "首页", item: `${SITE_ORIGIN}/` }];
  const parent = sectionParents[parts[0]];
  if (parent && relative !== parent[1]) {
    items.push({ "@type": "ListItem", position: 2, name: parent[0], item: `${SITE_ORIGIN}/${parent[1]}` });
  }
  items.push({ "@type": "ListItem", position: items.length + 1, name: pageName, item: canonicalUrl });
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
}

function homeStructuredData(description) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        url: `${SITE_ORIGIN}/`,
        name: "重庆大学千里战队",
        alternateName: ["CQU Qianli", "重庆大学 RoboMaster 千里战队"],
        description,
        inLanguage: "zh-CN",
        publisher: { "@id": `${SITE_ORIGIN}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_ORIGIN}/#organization`,
        name: "重庆大学千里战队",
        alternateName: "CQU Qianli",
        url: `${SITE_ORIGIN}/`,
        logo: `${SITE_ORIGIN}/assets/images/brand/%E5%8D%83%E9%87%8C%E9%A9%AC%E5%A4%B4logo.PNG`,
        image: SOCIAL_IMAGE,
        email: "Qianli@lark.cquqian.li",
        parentOrganization: { "@type": "CollegeOrUniversity", name: "重庆大学", url: "https://www.cqu.edu.cn/" },
        sameAs: ["https://space.bilibili.com/1432987899"],
      },
    ],
  };
}

const pages = walkHtml(ROOT).sort();
const sitemapUrls = [];

for (const file of pages) {
  const relative = path.relative(ROOT, file).split(path.sep).join("/");
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(new RegExp(`\\s*${MANAGED_START}[\\s\\S]*?${MANAGED_END}\\s*`, "g"), "\n");

  const currentTitle = stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
  const title = titleOverrides[relative] || currentTitle;
  if (!title) throw new Error(`Missing title: ${relative}`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(title)}</title>`);

  const existingDescription = htmlDecode(html.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i)?.[1] || "");
  const description = descriptionOverrides[relative] || (existingDescription === DEFAULT_DESCRIPTION ? `了解${title.replace(/\s*[|｜].*$/, "")}相关内容与重庆大学千里战队的公开信息。` : existingDescription);
  if (!description) {
    if (relative === "contact/social.html") {
      html = html.replace(/(<meta\s+name="viewport"[^>]*>)/i, `$1\n    <meta name="description" content="正在前往重庆大学千里战队的联系与关注页面。" />`);
    } else {
      throw new Error(`Missing description: ${relative}`);
    }
  } else if (/<meta\s+name="description"/i.test(html)) {
    html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${htmlEscape(description)}" />`);
  } else {
    html = html.replace(/(<meta\s+name="viewport"[^>]*>)/i, `$1\n    <meta name="description" content="${htmlEscape(description)}" />`);
  }

  const isNoIndex = relative === "404.html" || relative === "contact/social.html" || /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);
  if (!isNoIndex) {
    const canonicalUrl = `${SITE_ORIGIN}${canonicalPath(relative)}`;
    const pageName = title.replace(/\s*[|｜].*$/, "");
    const structured = relative === "index.html" ? homeStructuredData(description) : breadcrumbData(relative, pageName, canonicalUrl);
    const seoBlock = [
      MANAGED_START,
      `    <link rel="canonical" href="${canonicalUrl}" />`,
      "    <meta property=\"og:locale\" content=\"zh_CN\" />",
      "    <meta property=\"og:type\" content=\"website\" />",
      "    <meta property=\"og:site_name\" content=\"重庆大学千里战队\" />",
      `    <meta property="og:title" content="${htmlEscape(title)}" />`,
      `    <meta property="og:description" content="${htmlEscape(description)}" />`,
      `    <meta property="og:url" content="${canonicalUrl}" />`,
      `    <meta property="og:image" content="${SOCIAL_IMAGE}" />`,
      "    <meta property=\"og:image:alt\" content=\"重庆大学千里战队\" />",
      "    <meta name=\"twitter:card\" content=\"summary_large_image\" />",
      `    <meta name="twitter:title" content="${htmlEscape(title)}" />`,
      `    <meta name="twitter:description" content="${htmlEscape(description)}" />`,
      `    <meta name="twitter:image" content="${SOCIAL_IMAGE}" />`,
      "    <script type=\"application/ld+json\">",
      JSON.stringify(structured, null, 2).split("\n").map((line) => `    ${line}`).join("\n"),
      "    </script>",
      `    ${MANAGED_END}`,
    ].join("\n");
    html = html.replace(/(<meta\s+name="description"[^>]*>)/i, `$1\n    ${seoBlock}`);
    sitemapUrls.push(canonicalUrl);
  }

  fs.writeFileSync(file, html);
}

const sitemap = [
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
  "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
  ...sitemapUrls.map((url) => `  <url><loc>${url}</loc></url>`),
  "</urlset>",
  "",
].join("\n");
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);

const robots = [
  "User-agent: *",
  "Allow: /",
  "",
  `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
  "",
].join("\n");
fs.writeFileSync(path.join(ROOT, "robots.txt"), robots);

console.log(`SEO metadata updated for ${pages.length} pages; sitemap contains ${sitemapUrls.length} canonical URLs.`);
