const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function collectHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtmlFiles(target);
    return entry.isFile() && entry.name.endsWith(".html") ? [target] : [];
  });
}

function activeAttributes(active, key) {
  return active === key ? ' class="is-active" aria-current="page"' : "";
}

function buildNavigation(active) {
  return `        <div class="nav-links" id="nav-links">
          <span class="nav-menu">
            <a${activeAttributes(active, "about")} href="about/index.html" data-nav="about" aria-haspopup="true"><i class="mdi mdi-account-group-outline nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">关于千里</span></a>
            <span class="nav-dropdown">
              <a class="nav-item-with-icon nav-item-with-icon--about" href="about/index.html"><span class="nav-item-label">战队简介</span><i class="mdi mdi-card-account-details-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--about" href="about/history.html"><span class="nav-item-label">发展历程</span><i class="mdi mdi-timeline-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--about" href="about/resources.html"><span class="nav-item-label">团队资源</span><i class="mdi mdi-toolbox-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--about" href="about/culture.html"><span class="nav-item-label">精神和文化</span><i class="mdi mdi-fire nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--about" href="about/management.html"><span class="nav-item-label">管理和协作</span><i class="mdi mdi-account-cog-outline nav-item-mdi" aria-hidden="true"></i></a>
            </span>
          </span>
          <span class="nav-menu nav-menu--organization">
            <a${activeAttributes(active, "organization")} href="about/organization.html" data-nav="organization" aria-haspopup="true"><i class="mdi mdi-sitemap-outline nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">组织架构</span></a>
            <span class="nav-dropdown nav-dropdown--organization">
              <span class="nav-dropdown-column">
                <span class="nav-dropdown-column-title"><i class="mdi mdi-cog-outline" aria-hidden="true"></i><strong>技术组别</strong></span>
                <a class="nav-item-with-icon nav-item-with-icon--mechanical" href="groups/mechanical.html"><span class="nav-item-label">机械结构组</span><span class="nav-item-logo nav-item-logo--mechanical" aria-hidden="true"><img src="assets/images/brand/vector-icons/mechanical.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--control" href="groups/control.html"><span class="nav-item-label">电气控制组</span><span class="nav-item-logo nav-item-logo--control" aria-hidden="true"><img src="assets/images/brand/vector-icons/control.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--vision" href="groups/vision.html"><span class="nav-item-label">视觉算法组</span><span class="nav-item-logo nav-item-logo--vision" aria-hidden="true"><img src="assets/images/brand/vector-icons/vision.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--hardware" href="groups/hardware.html"><span class="nav-item-label">硬件开发组</span><span class="nav-item-logo nav-item-logo--hardware" aria-hidden="true"><img src="assets/images/brand/vector-icons/hardware.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--operations" href="groups/operations.html"><span class="nav-item-label">宣传运营组</span><span class="nav-item-logo nav-item-logo--operations" aria-hidden="true"><img src="assets/images/brand/vector-icons/operations.svg" alt="" /></span></a>
              </span>
              <span class="nav-dropdown-column">
                <span class="nav-dropdown-column-title"><i class="mdi mdi-clipboard-account-outline" aria-hidden="true"></i><strong>责任组别</strong></span>
                <a class="nav-item-with-icon nav-item-with-icon--responsibility" href="groups/responsibility-management.html"><span class="nav-item-label">管理层</span><span class="nav-item-logo nav-item-logo--horse" aria-hidden="true"><img src="assets/images/brand/group-icons/horse.png" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--responsibility" href="groups/responsibility-tactics.html"><span class="nav-item-label">竞技战术组</span><span class="nav-item-logo nav-item-logo--horse" aria-hidden="true"><img src="assets/images/brand/group-icons/horse.png" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--responsibility" href="groups/responsibility-infrastructure.html"><span class="nav-item-label">基建效率组</span><span class="nav-item-logo nav-item-logo--infrastructure" aria-hidden="true"><img src="assets/images/brand/group-icons/infrastructure.png" alt="" /></span></a>
              </span>
              <span class="nav-dropdown-column">
                <span class="nav-dropdown-column-title"><i class="mdi mdi-robot" aria-hidden="true"></i><strong>兵种组别</strong></span>
                <a class="nav-item-with-icon nav-item-with-icon--unit" href="groups/unit-heavy.html"><span class="nav-item-label">重装组</span><span class="nav-item-logo-pair" aria-hidden="true"><img src="assets/images/brand/vector-icons/hero.svg" alt="" /><img src="assets/images/brand/vector-icons/engineer.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--unit" href="groups/unit-sentry.html"><span class="nav-item-label">步哨组</span><span class="nav-item-logo-pair" aria-hidden="true"><img src="assets/images/brand/vector-icons/infantry.svg" alt="" /><img src="assets/images/brand/vector-icons/sentry.svg" alt="" /></span></a>
                <a class="nav-item-with-icon nav-item-with-icon--unit" href="groups/unit-aerial-dart.html"><span class="nav-item-label">空中飞镖组</span><span class="nav-item-logo-pair" aria-hidden="true"><img src="assets/images/brand/vector-icons/aerial.svg" alt="" /><img src="assets/images/brand/vector-icons/dart.svg" alt="" /></span></a>
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
            <a${activeAttributes(active, "frontline")} href="season/index.html" data-nav="frontline" aria-haspopup="true"><i class="mdi mdi-stadium nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">RM一线</span></a>
            <span class="nav-dropdown">
              <a class="nav-item-with-icon nav-item-with-icon--frontline" href="season/index.html"><span class="nav-item-label">千里时刻</span><i class="mdi mdi-newspaper-variant-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--frontline" href="season/calendar.html"><span class="nav-item-label">备赛日历</span><i class="mdi mdi-calendar-clock-outline nav-item-mdi" aria-hidden="true"></i></a>
            </span>
          </span>
          <span class="nav-menu">
            <a${activeAttributes(active, "archive")} href="museum/index.html" data-nav="archive" aria-haspopup="true"><i class="mdi mdi-bank-outline nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">千里博物馆</span></a>
            <span class="nav-dropdown">
              <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/resources.html"><span class="nav-item-label">资料站</span><i class="mdi mdi-bookshelf nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/gallery.html"><span class="nav-item-label">照片墙</span><i class="mdi mdi-image-multiple-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/records.html"><span class="nav-item-label">档案馆</span><i class="mdi mdi-archive-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/hall-of-fame.html"><span class="nav-item-label">名人堂</span><i class="mdi mdi-account-star-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/stories.html"><span class="nav-item-label">故事会</span><i class="mdi mdi-book-open-variant nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--archive" href="museum/guestbook.html"><span class="nav-item-label">留言板</span><i class="mdi mdi-message-text-outline nav-item-mdi" aria-hidden="true"></i></a>
            </span>
          </span>
          <span class="nav-menu">
            <a${activeAttributes(active, "join")} href="join/index.html" data-nav="join" aria-haspopup="true"><i class="mdi mdi-account-plus-outline nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">加入我们</span></a>
            <span class="nav-dropdown">
              <a class="nav-item-with-icon nav-item-with-icon--join" href="join/index.html#recruit"><span class="nav-item-label">招新信息</span><i class="mdi mdi-bullhorn-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--join" href="join/index.html#groups"><span class="nav-item-label">各组方向</span><i class="mdi mdi-source-branch nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--join" href="join/index.html#persona"><span class="nav-item-label">人才画像</span><i class="mdi mdi-account-search-outline nav-item-mdi" aria-hidden="true"></i></a>
              <a class="nav-item-with-icon nav-item-with-icon--join" href="join/index.html#qa"><span class="nav-item-label">Q&amp;A</span><i class="mdi mdi-help-circle-outline nav-item-mdi" aria-hidden="true"></i></a>
            </span>
          </span>
          <a${activeAttributes(active, "contact")} href="contact/index.html" data-nav="contact"><i class="mdi mdi-email-outline nav-link-watermark" aria-hidden="true"></i><span class="nav-link-label">联系方式</span></a>
        </div>`;
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
  const navPattern = /        <div class="nav-links" id="nav-links">[\s\S]*?<\/div>\r?\n        <button class="theme-toggle"/;
  if (!navPattern.test(html)) throw new Error(`Navigation block not found in ${relative}`);

  html = html.replace(navPattern, `${buildNavigation(page)}\n        <button class="theme-toggle"`);
  html = html.replace(/styles\.css\?v=20260819-\d+/g, "styles.css?v=20260819-15");
  html = html.replace(/site\.js\?v=20260819-\d+/g, "site.js?v=20260819-8");
  fs.writeFileSync(file, html);
}

console.log(`Updated navigation in ${htmlFiles.length} pages.`);
