const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function collectHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "poster-official-launch") return [];
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtmlFiles(target);
    const relative = path.relative(root, target).replaceAll(path.sep, "/");
    return entry.isFile() && entry.name.endsWith(".html") && relative !== "contact/social.html" ? [target] : [];
  });
}

function activeAttributes(active, key) {
  return active === key ? ' class="is-active" aria-current="page"' : "";
}

function getBackTarget(relative) {
  if (relative === "index.html") return null;

  const primaryPages = new Set([
    "about/index.html",
    "about/organization.html",
    "season/index.html",
    "museum/index.html",
    "join/index.html",
    "contact/index.html",
    "contact/sponsorship.html",
  ]);

  if (primaryPages.has(relative)) return { href: "index.html", label: "返回主页" };
  if (relative.startsWith("groups/")) return { href: "about/organization.html", label: "返回团队架构" };
  if (relative.startsWith("about/")) return { href: "about/index.html", label: "返回关于千里" };
  if (relative.startsWith("season/")) return { href: "season/index.html", label: "返回赛季一线" };
  if (relative.startsWith("museum/training/")) return { href: "museum/resources.html", label: "返回资料站" };
  if (["museum/records.html", "museum/honors.html"].includes(relative)) {
    return { href: "museum/projects.html", label: "返回档案馆" };
  }
  if (relative.startsWith("museum/")) return { href: "museum/index.html", label: "返回千里博物馆" };
  if (relative.startsWith("join/")) return { href: "join/index.html", label: "返回纳新通道" };
  if (relative.startsWith("contact/")) return { href: "contact/sponsorship.html", label: "返回合作招商" };

  return { href: "index.html", label: "返回主页" };
}

function buildBackNavigation(relative) {
  const target = getBackTarget(relative);
  if (!target) return "";

  return `    <div class="page-back-nav">
      <a class="page-back-link" href="${target.href}" aria-label="${target.label}" title="${target.label}">
        <i class="mdi mdi-arrow-left" aria-hidden="true"></i>
      </a>
    </div>`;
}

function buildNavigation(active) {
  return `        <div class="nav-links" id="nav-links">
          <span class="nav-menu">
            <a${activeAttributes(active, "about")} href="about/index.html" data-nav="about" aria-haspopup="true"><i class="mdi mdi-account-group-outline nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">关于千里</span></a>
            <span class="nav-dropdown">
              <a class="nav-item-with-icon nav-item-with-icon--about" href="about/history.html"><span class="nav-item-label">发展历程</span><i class="mdi mdi-timeline-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--about" href="about/resources.html"><span class="nav-item-label">团队资源</span><i class="mdi mdi-toolbox-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--about" href="about/culture.html"><span class="nav-item-label">精神和文化</span><i class="mdi mdi-fire nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--about" href="about/management.html"><span class="nav-item-label">管理与协作</span><i class="mdi mdi-account-cog-outline nav-item-mdi" aria-hidden="true"></i></a>
            </span>
          </span>
          <span class="nav-menu">
            <a${activeAttributes(active, "frontline")} href="season/index.html" data-nav="frontline" aria-haspopup="true"><i class="mdi mdi-stadium nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">赛季一线</span></a>
            <span class="nav-dropdown">
              <a class="nav-item-with-icon nav-item-with-icon--frontline" href="season/index.html"><span class="nav-item-label">千里要闻</span><i class="mdi mdi-newspaper-variant-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--frontline" href="season/members.html"><span class="nav-item-label">战队成员</span><i class="mdi mdi-card-account-details-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--frontline" href="season/calendar.html"><span class="nav-item-label">备赛日历</span><i class="mdi mdi-calendar-clock-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--frontline" href="season/events.html"><span class="nav-item-label">活动预告</span><i class="mdi mdi-calendar-star nav-item-mdi" aria-hidden="true"></i></a>
            </span>
          </span>
          <span class="nav-menu nav-menu--organization">
            <a${activeAttributes(active, "organization")} href="about/organization.html" data-nav="organization" aria-haspopup="true"><i class="mdi mdi-sitemap-outline nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">团队架构</span></a>
            <span class="nav-dropdown nav-dropdown--organization">
              <span class="nav-dropdown-column">
                <span class="nav-dropdown-column-title"><i class="mdi mdi-cog-outline" aria-hidden="true"></i><strong>技术组别</strong></span>
                <a class="nav-item-with-icon nav-item-with-icon--mechanical" href="groups/mechanical.html"><span class="nav-item-label">机械组</span><span class="nav-item-logo nav-item-logo--mechanical" aria-hidden="true"><img src="assets/images/brand/vector-icons/mechanical.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--control" href="groups/control.html"><span class="nav-item-label">电控组</span><span class="nav-item-logo nav-item-logo--control" aria-hidden="true"><img src="assets/images/brand/vector-icons/control.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--vision" href="groups/vision.html"><span class="nav-item-label">视觉组</span><span class="nav-item-logo nav-item-logo--vision" aria-hidden="true"><img src="assets/images/brand/vector-icons/vision.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--hardware" href="groups/hardware.html"><span class="nav-item-label">硬件组</span><span class="nav-item-logo nav-item-logo--hardware" aria-hidden="true"><img src="assets/images/brand/vector-icons/hardware.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--operations" href="groups/operations.html"><span class="nav-item-label">宣运组</span><span class="nav-item-logo nav-item-logo--operations" aria-hidden="true"><img src="assets/images/brand/vector-icons/operations.svg" alt="" /></span></a>
              </span>
              <span class="nav-dropdown-column">
                <span class="nav-dropdown-column-title"><i class="mdi mdi-robot" aria-hidden="true"></i><strong>兵种组别</strong></span>
                <a class="nav-item-with-icon nav-item-with-icon--unit" href="groups/unit-heavy.html"><span class="nav-item-label">重装组</span><span class="nav-item-logo-pair" aria-hidden="true"><img src="assets/images/brand/vector-icons/hero.svg" alt="" /><img src="assets/images/brand/vector-icons/engineer.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--unit" href="groups/unit-sentry.html"><span class="nav-item-label">步哨组</span><span class="nav-item-logo-pair" aria-hidden="true"><img src="assets/images/brand/vector-icons/infantry.svg" alt="" /><img src="assets/images/brand/vector-icons/sentry.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--unit" href="groups/unit-aerial-dart.html"><span class="nav-item-label">空中飞镖组</span><span class="nav-item-logo-pair" aria-hidden="true"><img src="assets/images/brand/vector-icons/aerial.svg" alt="" /><img src="assets/images/brand/vector-icons/dart.svg" alt="" /></span></a>
              </span>
              <span class="nav-dropdown-column">
                <span class="nav-dropdown-column-title"><i class="mdi mdi-clipboard-account-outline" aria-hidden="true"></i><strong>责任组别</strong></span>
                <a class="nav-item-with-icon nav-item-with-icon--responsibility" href="groups/responsibility-management.html"><span class="nav-item-label">管理层</span><span class="nav-item-logo nav-item-logo--horse" aria-hidden="true"><img src="assets/images/brand/group-icons/horse.png" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--responsibility" href="groups/responsibility-tactics.html"><span class="nav-item-label">竞技战术组</span><span class="nav-item-logo nav-item-logo--robomaster" aria-hidden="true"><img src="assets/images/brand/group-icons/robomaster.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--responsibility" href="groups/responsibility-infrastructure.html"><span class="nav-item-label">基建效率组</span><span class="nav-item-logo nav-item-logo--infrastructure" aria-hidden="true"><img src="assets/images/brand/group-icons/infrastructure.png" alt="" /></span></a>
              </span>
              <span class="nav-dropdown-column">
                <span class="nav-dropdown-column-title"><i class="mdi mdi-layers-triple-outline" aria-hidden="true"></i><strong>定位组别</strong></span>
                <a class="nav-item-with-icon nav-item-with-icon--position" href="groups/position-advisors.html"><span class="nav-item-label">顾问层</span><i class="mdi mdi-account-tie-outline nav-item-mdi" aria-hidden="true"></i></a>
                <a class="nav-item-with-icon nav-item-with-icon--position" href="groups/position-members.html"><span class="nav-item-label">正式队员层</span><i class="mdi mdi-account-check-outline nav-item-mdi" aria-hidden="true"></i></a>
                <a class="nav-item-with-icon nav-item-with-icon--position" href="groups/position-trainees.html"><span class="nav-item-label">梯队队员层</span><i class="mdi mdi-school-outline nav-item-mdi" aria-hidden="true"></i></a>
              </span>
            </span>
          </span>
          <span class="nav-menu">
            <a${activeAttributes(active, "archive")} href="museum/index.html" data-nav="archive" aria-haspopup="true"><i class="mdi mdi-bank-outline nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">千里博物馆</span></a>
            <span class="nav-dropdown nav-dropdown--museum">
              <span class="nav-dropdown-column">
                <span class="nav-dropdown-column-title"><i class="mdi mdi-road-variant" aria-hidden="true"></i><strong>传承之路</strong></span>
                <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/resources.html"><span class="nav-item-label">资料站</span><i class="mdi mdi-bookshelf nav-item-mdi" aria-hidden="true"></i></a>
                <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/projects.html"><span class="nav-item-label">档案馆</span><i class="mdi mdi-archive-outline nav-item-mdi" aria-hidden="true"></i></a>
                <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/gallery.html"><span class="nav-item-label">照片墙</span><i class="mdi mdi-image-multiple-outline nav-item-mdi" aria-hidden="true"></i></a>
                <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/hall-of-fame.html"><span class="nav-item-label">名人堂</span><i class="mdi mdi-account-star-outline nav-item-mdi" aria-hidden="true"></i></a>
              </span>
              <span class="nav-dropdown-column">
                <span class="nav-dropdown-column-title"><i class="mdi mdi-party-popper" aria-hidden="true"></i><strong>轻松一刻</strong></span>
                <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/shop.html"><span class="nav-item-label">周边橱窗</span><i class="mdi mdi-shopping-outline nav-item-mdi" aria-hidden="true"></i></a>
                <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/memes.html"><span class="nav-item-label">梗指南</span><i class="mdi mdi-lightbulb-on-outline nav-item-mdi" aria-hidden="true"></i></a>
                <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/stories.html"><span class="nav-item-label">故事会</span><i class="mdi mdi-book-open-variant nav-item-mdi" aria-hidden="true"></i></a>
                <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/guestbook.html"><span class="nav-item-label">留言板</span><i class="mdi mdi-message-text-outline nav-item-mdi" aria-hidden="true"></i></a>
              </span>
            </span>
          </span>
          <span class="nav-menu nav-menu--join">
            <a${activeAttributes(active, "join")} href="join/index.html" data-nav="join" aria-haspopup="true"><i class="mdi mdi-account-plus-outline nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">纳新通道</span></a>
            <span class="nav-dropdown">
              <a class="nav-item-with-icon nav-item-with-icon--join" href="join/guide.html"><span class="nav-item-label">加入我们</span><i class="mdi mdi-clipboard-check-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--join" href="join/persona.html"><span class="nav-item-label">人才画像</span><i class="mdi mdi-account-search-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--join" href="join/qa.html"><span class="nav-item-label">Q&amp;A</span><i class="mdi mdi-help-circle-outline nav-item-mdi" aria-hidden="true"></i></a>
            </span>
          </span>
          <span class="nav-menu nav-menu--contact">
            <a${activeAttributes(active, "contact")} href="contact/sponsorship.html" data-nav="contact" aria-haspopup="true"><i class="mdi mdi-handshake-outline nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">合作招商</span></a>
            <span class="nav-dropdown">
              <a class="nav-item-with-icon nav-item-with-icon--contact" href="contact/sponsorship.html"><span class="nav-item-label">赞助合作</span><i class="mdi mdi-domain nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--contact" href="contact/outreach.html"><span class="nav-item-label">科创教育活动</span><i class="mdi mdi-school-outline nav-item-mdi" aria-hidden="true"></i></a>
            </span>
          </span>
        </div>`;
}

function normalizeFooter(html, relative) {
  const footerPattern = /<footer class="site-footer">[\s\S]*?<\/footer>/;
  if (!footerPattern.test(html)) throw new Error(`Footer block not found in ${relative}`);

  const footer = `<footer class="site-footer">
      <p>© 2026 重庆大学千里战队. <span lang="en">All Rights Reserved.</span></p>
      <p>网站建设：重庆大学千里战队 × Codex</p>
      <p class="site-footer-domains">可用域名：<a href="https://team.cquqianli.cn/">team.cquqianli.cn</a><span aria-hidden="true"> · </span><a href="https://team.cquqian.li/">team.cquqian.li</a></p>
      <p class="site-footer-icp"><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">闽ICP备2026005064号</a></p>
    </footer>`;

  return html.replace(footerPattern, footer);
}

function normalizeMascotScripts(html) {
  html = html.replace(/\s*<script src="assets\/js\/data\/mascot-config\.js\?v=[^"]+"><\/script>/g, "");
  html = html.replace(/\s*<script src="assets\/js\/pages\/home-mascot\.js\?v=[^"]+"><\/script>/g, "");

  const bodyClosePattern = /(\r?\n\s*)<\/body>/;
  if (!bodyClosePattern.test(html)) throw new Error("Closing body tag not found while adding mascot scripts");

  return html.replace(
    bodyClosePattern,
    `$1<script src="assets/js/data/mascot-config.js?v=20260828-2"></script>$1<script src="assets/js/pages/home-mascot.js?v=20260828-8"></script>$1</body>`,
  );
}

const htmlFiles = collectHtmlFiles(root);

for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  let html = fs.readFileSync(file, "utf8");
  const organizationPage = relative === "about/organization.html" || relative.startsWith("groups/");

  if (organizationPage) {
    html = html.replace(/<body data-page="[^"]+">/, '<body data-page="organization">');
  }

  const page = html.match(/<body data-page="([^"]+)">/)?.[1] || "";
  const navPattern = /        <div class="nav-links" id="nav-links">[\s\S]*?<\/div>\r?\n(?=        (?:<div class="nav-utilities">|<button class="theme-toggle"))/;
  if (!navPattern.test(html)) throw new Error(`Navigation block not found in ${relative}`);

  html = html.replace(navPattern, `${buildNavigation(page)}\n`);

  if (!html.includes('class="nav-map-link"')) {
    const themeButtonPattern = /(        <button class="theme-toggle"[\s\S]*?<\/button>)/;
    if (!themeButtonPattern.test(html)) throw new Error(`Theme toggle not found in ${relative}`);
    html = html.replace(
      themeButtonPattern,
      `        <div class="nav-utilities">\n          <a class="nav-map-link" href="https://surl.amap.com/3BY4rZMTgqz" target="_blank" rel="noopener noreferrer" aria-label="在高德地图中导航至千里战队实验室" title="导航至千里战队实验室"><i class="mdi mdi-map-marker-radius-outline" aria-hidden="true"></i></a>\n$1\n        </div>`,
    );
  }

  html = html.replace(/\s*<div class="page-back-nav">[\s\S]*?<\/div>\s*(?=<main\b)/, "\n");
  const backNavigation = buildBackNavigation(relative);
  if (backNavigation) {
    const mainPattern = /(\r?\n\s*)<main\b/;
    if (!mainPattern.test(html)) throw new Error(`Main content not found in ${relative}`);
    html = html.replace(mainPattern, `\n${backNavigation}$1<main`);
  }

  html = normalizeFooter(html, relative);
  html = normalizeMascotScripts(html);

  html = html.replace(/styles\.css\?v=\d{8}-\d+/g, "styles.css?v=20260830-1");
  html = html.replace(/site\.js\?v=\d{8}-\d+/g, "site.js?v=20260825-81");
  fs.writeFileSync(file, html);
}

console.log(`Updated navigation in ${htmlFiles.length} pages.`);
