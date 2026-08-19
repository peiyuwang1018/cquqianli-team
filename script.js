const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  themeToggle?.setAttribute("aria-pressed", String(theme === "dark"));
}

applyTheme(savedTheme || "dark");

navToggle?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

themeToggle?.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark"));

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const quoteStage = document.querySelector("[data-quote-stage]");
const quoteText = document.querySelector("[data-quote-text]");
const quoteSource = document.querySelector("[data-quote-source]");
const quoteButton = document.querySelector(".quote-random-button");
const fallbackQuotes = [{ text: "运筹帷幄，决胜千里", source: "重庆大学 千里战队" }];
const quotes = Array.isArray(window.QIANLI_QUOTES) && window.QIANLI_QUOTES.length ? window.QIANLI_QUOTES : fallbackQuotes;
let quoteIndex = 0;
let quoteTimer = null;

function updateQuote(nextIndex) {
  if (!quoteStage || !quoteText || !quoteSource || !quotes[nextIndex]) return;

  const quote = quotes[nextIndex];
  const applyQuote = () => {
    quoteText.textContent = quote.text;
    quoteSource.textContent = quote.source ? `—— ${quote.source}` : "";
    quoteStage.classList.remove("is-switching");
  };

  quoteIndex = nextIndex;

  if (reducedMotion.matches) {
    applyQuote();
    return;
  }

  quoteStage.classList.add("is-switching");
  window.setTimeout(applyQuote, 360);
}

function scheduleNextQuote() {
  if (!quoteStage || quotes.length < 2) return;
  window.clearInterval(quoteTimer);
  quoteTimer = window.setInterval(() => {
    updateQuote((quoteIndex + 1) % quotes.length);
  }, 5000);
}

quoteButton?.addEventListener("click", () => {
  let nextIndex = Math.floor(Math.random() * quotes.length);
  if (quotes.length > 1 && nextIndex === quoteIndex) {
    nextIndex = (nextIndex + 1) % quotes.length;
  }
  updateQuote(nextIndex);
  scheduleNextQuote();
});

scheduleNextQuote();
const videoCarousel = document.querySelector("[data-video-carousel]");
const videoFrame = document.querySelector("[data-video-frame]");
const videoType = document.querySelector("[data-video-type]");
const videoTitle = document.querySelector("[data-video-title]");
const videoSubtitle = document.querySelector("[data-video-subtitle]");
const videoDescription = document.querySelector("[data-video-description]");
const videoPrev = document.querySelector("[data-video-prev]");
const videoNext = document.querySelector("[data-video-next]");
const videoList = document.querySelector("[data-video-list]");
const videos = Array.isArray(window.QIANLI_VIDEOS) ? window.QIANLI_VIDEOS.filter((item) => item?.bvid) : [];
let videoIndex = 0;

function buildBilibiliEmbed(video) {
  const params = new URLSearchParams({
    isOutside: "true",
    bvid: video.bvid,
    p: String(video.page || 1),
    autoplay: "0",
    danmaku: "0"
  });
  if (video.t) params.set("t", String(video.t));
  return `https://player.bilibili.com/player.html?${params.toString()}`;
}

function formatVideoTitle(video) {
  return video.title ? `《${video.title}》` : "千里影像";
}

function renderVideo(index) {
  if (!videoCarousel || !videoFrame || !videos[index]) return;

  const video = videos[index];
  videoFrame.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.src = buildBilibiliEmbed(video);
  iframe.title = formatVideoTitle(video);
  iframe.loading = "lazy";
  iframe.allow = "fullscreen; autoplay; encrypted-media; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("frameborder", "0");
  videoFrame.append(iframe);

  if (videoType) videoType.textContent = video.type || "VIDEO ARCHIVE";
  if (videoSubtitle) videoSubtitle.textContent = video.subtitle || "";
  if (videoTitle) videoTitle.textContent = formatVideoTitle(video);
  if (videoDescription) videoDescription.textContent = video.description || "";
  videoIndex = index;
  videoList?.querySelectorAll("button").forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === index);
    button.setAttribute("aria-pressed", String(buttonIndex === index));
  });
}

if (videoCarousel) {
  videoCarousel.classList.toggle("has-videos", videos.length > 0);

  if (videoList && videos.length) {
    const buttons = videos.map((video, index) => {
      const button = document.createElement("button");
      button.type = "button";
      const meta = video.subtitle || video.type || "VIDEO";
      button.innerHTML = `<span>${meta}</span><strong>${formatVideoTitle(video)}</strong>`;
      button.addEventListener("click", () => renderVideo(index));
      return button;
    });
    videoList.replaceChildren(...buttons);
  }

  videoPrev?.toggleAttribute("disabled", videos.length < 2);
  videoNext?.toggleAttribute("disabled", videos.length < 2);
  renderVideo(0);

  videoPrev?.addEventListener("click", () => renderVideo((videoIndex - 1 + videos.length) % videos.length));
  videoNext?.addEventListener("click", () => renderVideo((videoIndex + 1) % videos.length));
}

const gallery = document.querySelector("[data-gallery]");
const galleryTabs = gallery ? [...gallery.querySelectorAll("[data-gallery-tab]")] : [];
const galleryPanels = gallery ? [...gallery.querySelectorAll("[data-gallery-panel]")] : [];
const robotGallery = document.querySelector("[data-robot-gallery]");
const galleryLightbox = document.querySelector("[data-gallery-lightbox]");
const galleryLightboxImage = document.querySelector("[data-gallery-lightbox-image]");
const galleryLightboxTitle = document.querySelector("[data-gallery-lightbox-title]");
const galleryLightboxMeta = document.querySelector("[data-gallery-lightbox-meta]");
const galleryLightboxSummary = document.querySelector("[data-gallery-lightbox-summary]");
const galleryLightboxLegacy = document.querySelector("[data-gallery-lightbox-legacy]");
const galleryLightboxService = document.querySelector("[data-gallery-lightbox-service]");
const galleryLightboxContributors = document.querySelector("[data-gallery-lightbox-contributors]");
const galleryClose = document.querySelector("[data-gallery-close]");
const galleryPrev = document.querySelector("[data-gallery-prev]");
const galleryNext = document.querySelector("[data-gallery-next]");
const gallerySeasonSwitch = document.querySelector("[data-gallery-season-switch]");
const gallerySeasonDescription = document.querySelector("[data-gallery-season-description]");
const galleryLightboxServiceLabel = document.querySelector("[data-gallery-lightbox-service-label]");
const galleryContributorsSection = document.querySelector("[data-gallery-lightbox-contributors-section]");
const teamPhotoGallery = document.querySelector("[data-team-photo-gallery]");
const gallerySeasons = Array.isArray(window.QIANLI_GALLERY?.seasons) ? window.QIANLI_GALLERY.seasons : [];
const galleryCollections = window.QIANLI_GALLERY?.collections || {};
let galleryRobots = [];
let galleryRobotIndex = 0;

function parseRobotRecord(record = "") {
  const sections = [...record.matchAll(/【([^】]+)】([\s\S]*?)(?=【|$)/g)].map((match) => ({
    label: match[1].trim(),
    value: match[2].trim(),
  }));
  return {
    summary: sections.find((section) => section.label === "简介")?.value || "档案内容待补充。",
    service: sections.find((section) => section.label === "服役周期")?.value || "未记录",
    contributors: sections.filter((section) => !["简介", "服役周期"].includes(section.label) && section.value),
  };
}

function activateGalleryTab(name, moveFocus = false) {
  const activeTab = galleryTabs.find((tab) => tab.dataset.galleryTab === name);
  if (!activeTab) return;

  galleryTabs.forEach((tab) => {
    const active = tab === activeTab;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  galleryPanels.forEach((panel) => {
    panel.hidden = panel.dataset.galleryPanel !== name;
  });

  if (moveFocus) activeTab.focus();
}

function renderGalleryLightbox(index) {
  if (!galleryLightbox || !galleryLightboxImage || !galleryRobots[index]?.photo) return;

  const robot = galleryRobots[index];
  const details = parseRobotRecord(robot.record);
  galleryRobotIndex = index;
  galleryLightboxImage.src = robot.photo;
  galleryLightboxImage.alt = `${robot.title}图片`;
  if (galleryLightboxTitle) galleryLightboxTitle.textContent = robot.title;
  if (galleryLightboxMeta) galleryLightboxMeta.textContent = robot.meta;
  if (galleryLightboxSummary) galleryLightboxSummary.textContent = details.summary;
  if (galleryLightboxLegacy) {
    galleryLightboxLegacy.textContent = robot.legacy;
    galleryLightboxLegacy.hidden = !robot.legacy;
  }
  if (galleryLightboxService) galleryLightboxService.textContent = details.service;
  if (galleryLightboxServiceLabel) galleryLightboxServiceLabel.textContent = robot.serviceLabel || "服役周期";
  if (galleryLightboxContributors) {
    const contributorRows = details.contributors.map((contributor) => {
      const row = document.createElement("div");
      const label = document.createElement("span");
      const people = document.createElement("strong");
      label.textContent = contributor.label;
      people.textContent = contributor.value;
      row.append(label, people);
      return row;
    });
    galleryLightboxContributors.replaceChildren(...contributorRows);
    if (galleryContributorsSection) galleryContributorsSection.hidden = !contributorRows.length;
  }

  if (!galleryLightbox.open) {
    galleryLightbox.showModal();
    document.documentElement.classList.add("has-gallery-lightbox");
  }
}

function changeGalleryRobot(offset) {
  const photoIndexes = galleryRobots.reduce((indexes, robot, index) => {
    if (robot.photo) indexes.push(index);
    return indexes;
  }, []);
  if (!photoIndexes.length) return;

  const currentPhotoIndex = photoIndexes.indexOf(galleryRobotIndex);
  const nextPhotoIndex = (currentPhotoIndex + offset + photoIndexes.length) % photoIndexes.length;
  renderGalleryLightbox(photoIndexes[nextPhotoIndex]);
}

function renderRobotGallery(seasonId) {
  if (!robotGallery) return;

  const season = gallerySeasons.find((item) => item.id === seasonId) || gallerySeasons[0];
  if (!season) return;

  galleryRobots = Array.isArray(season.robots) ? season.robots : [];
  if (gallerySeasonDescription) gallerySeasonDescription.textContent = season.description;

  gallerySeasonSwitch?.querySelectorAll("button").forEach((button) => {
    const active = button.dataset.gallerySeason === season.id;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const robotButtons = galleryRobots.map((robot, index) => {
    const item = document.createElement("button");
    item.className = "robot-gallery-item";
    item.type = "button";
    item.setAttribute("aria-label", `查看${robot.title}图片与档案`);

    const visual = document.createElement("span");
    visual.className = "robot-gallery-visual";
    const image = document.createElement("img");
    image.src = robot.cutout;
    image.alt = robot.title;
    image.loading = index < 5 ? "eager" : "lazy";
    image.decoding = "async";
    image.style.setProperty("--robot-scale", String(robot.scale || 1));
    image.style.setProperty("--robot-scale-hover", String((robot.scale || 1) * 1.025));
    image.style.setProperty("--robot-x", robot.shiftX || "0%");
    image.style.setProperty("--robot-y", robot.shiftY || "0%");
    visual.append(image);

    const caption = document.createElement("span");
    caption.className = "robot-gallery-caption";
    const title = document.createElement("strong");
    title.textContent = robot.title;
    const meta = document.createElement("small");
    meta.textContent = robot.meta;
    caption.append(title, meta);

    item.append(visual, caption);
    item.addEventListener("click", () => renderGalleryLightbox(index));
    return item;
  });

  robotGallery.replaceChildren(...robotButtons);
}

function renderTeamPhotoGallery() {
  if (!teamPhotoGallery) return;
  const photos = Array.isArray(galleryCollections.portraits) ? galleryCollections.portraits : [];
  const photoButtons = photos.map((photo, index) => {
    const item = document.createElement("button");
    item.className = "team-photo-item";
    item.type = "button";
    item.setAttribute("aria-label", `查看${photo.title}原图与拍摄信息`);

    const image = document.createElement("img");
    image.src = photo.preview || photo.photo;
    image.alt = photo.title;
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";

    const caption = document.createElement("span");
    caption.className = "team-photo-caption";
    const meta = document.createElement("small");
    meta.textContent = photo.meta;
    const title = document.createElement("strong");
    title.textContent = photo.title;
    caption.append(meta, title);

    item.append(image, caption);
    item.addEventListener("click", () => {
      galleryRobots = photos;
      renderGalleryLightbox(index);
    });
    return item;
  });
  teamPhotoGallery.replaceChildren(...photoButtons);
}

if (gallerySeasonSwitch && gallerySeasons.length) {
  const seasonButtons = gallerySeasons.map((season, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.gallerySeason = season.id;
    button.className = index === 0 ? "is-active" : "";
    button.setAttribute("aria-pressed", String(index === 0));
    button.textContent = season.id;
    button.addEventListener("click", () => renderRobotGallery(season.id));
    return button;
  });
  gallerySeasonSwitch.replaceChildren(...seasonButtons);
  renderRobotGallery(gallerySeasons[0].id);
}

renderTeamPhotoGallery();

galleryTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateGalleryTab(tab.dataset.galleryTab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % galleryTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + galleryTabs.length) % galleryTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = galleryTabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    activateGalleryTab(galleryTabs[nextIndex].dataset.galleryTab, true);
  });
});

galleryClose?.addEventListener("click", () => galleryLightbox?.close());
galleryPrev?.addEventListener("click", () => changeGalleryRobot(-1));
galleryNext?.addEventListener("click", () => changeGalleryRobot(1));

galleryLightbox?.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) galleryLightbox.close();
});

galleryLightbox?.addEventListener("close", () => {
  document.documentElement.classList.remove("has-gallery-lightbox");
  if (galleryLightboxImage) {
    galleryLightboxImage.removeAttribute("src");
    galleryLightboxImage.alt = "";
  }
});

document.addEventListener("keydown", (event) => {
  if (!galleryLightbox?.open) return;
  if (event.key === "ArrowLeft") changeGalleryRobot(-1);
  if (event.key === "ArrowRight") changeGalleryRobot(1);
});

function initRecruitLetter() {
  if (document.querySelector("[data-recruit-letter-trigger]")) return;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "recruit-letter-trigger";
  trigger.dataset.recruitLetterTrigger = "";
  trigger.setAttribute("aria-label", "打开给想加入同学的一封信");
  trigger.setAttribute("title", "给想加入千里的你");
  trigger.innerHTML = '<i class="mdi mdi-email-heart-outline" aria-hidden="true"></i>';

  const dialog = document.createElement("dialog");
  dialog.className = "recruit-letter-dialog";
  dialog.setAttribute("aria-labelledby", "recruit-letter-title");
  dialog.innerHTML = `
    <div class="recruit-letter-shell">
      <header class="recruit-letter-header">
        <div>
          <p class="page-label">A LETTER TO FUTURE MEMBERS</p>
          <h2 id="recruit-letter-title">致想加入千里战队的大一同学的一封信</h2>
        </div>
        <button class="recruit-letter-close" type="button" aria-label="关闭这封信">
          <i class="mdi mdi-close" aria-hidden="true"></i>
        </button>
      </header>
      <article class="recruit-letter-content">
        <div class="recruit-letter-opening">
          <p>刚进入大学的时候，很多人其实都处在一种很相似的状态。</p>
          <p>高中结束了，没有人再每天告诉你下一步该做什么。课程之外突然多出了很多可以自己支配的时间，你可以参加学生组织，可以打比赛，可以进实验室，可以刷绩点，可以谈恋爱，可以打游戏，也可以什么都先试一试。</p>
          <p>自由当然很好，但自由的另一面，是很多事情开始没有标准答案了。</p>
          <p>大学四年应该怎么过？以后想做什么？自己究竟擅长什么？喜欢什么？哪些事情值得投入大量时间？</p>
          <p>这些问题，我们也没有办法替你回答。</p>
          <p>RoboMaster 更不是这些问题的标准答案。</p>
          <p>但如果你希望大学里不只是上课、考试、完成作业，而是真的和一群人一起把一些东西做出来，那么千里战队可能是你值得了解的一种选择。</p>
        </div>

        <section>
          <h3><span>01</span>我们到底在做什么</h3>
          <p>RoboMaster 是一项机器人竞技赛事。</p>
          <p>和很多完成一个作品、提交一次答辩就结束的比赛不同，RM 的周期很长。一整个赛季里，我们要自己设计、制造、调试一整套机器人系统，并最终把这些机器人送上赛场，与其他高校的机器人进行真实对抗。</p>
          <p>这里面会有机械结构、电路与嵌入式系统、控制算法、计算机视觉、通信、软件、运营管理等很多方向。</p>
          <p>但真正进入队伍以后，你会慢慢发现，我们做的事情其实很难被简单分成“机械的事情”“电控的事情”“视觉的事情”或者“宣运的事情”。</p>
          <div class="recruit-letter-lines">
            <p>机械改动一个结构，可能会影响电路安装；</p>
            <p>电控修改一个通信协议，可能会影响算法和视觉；</p>
            <p>机器人的重量、成本、加工条件、维护难度、比赛时间，都可能让一个理论上很好的方案最后不得不被放弃。</p>
          </div>
          <p>真实工程就是这样。</p>
          <p>它很少给你一道已经写好条件、只需要求出唯一答案的题。</p>
          <p>你需要在很多约束里面不断做选择，也需要不断和别人交流、妥协、推翻自己的方案，再重新来过。</p>
          <p>这也是我们认为 RoboMaster 最有价值的地方之一。</p>
        </section>

        <section>
          <h3><span>02</span>如果我现在什么都不会，可以来吗？</h3>
          <p>完全可以。</p>
          <p>我们当然希望你来的时候已经有一些基础。也许你写过一点代码，也许接触过机械设计，也许自己做过一些小项目。</p>
          <p>但如果这些你都没有接触过，也并不意味着你没有机会。</p>
          <p>千里有相对完整的培训体系，有已经经历过多个赛季的老队员，也有和你们年龄相差不大的年轻队员。我们有真实的机器人项目，有固定工位、设备、加工条件和实验室，也愿意把我们已经走过的路、踩过的坑和积累下来的东西告诉后来的人。</p>
          <p>这些东西能够让你少走很多弯路。原本一个人可能需要几个月才能摸清楚的问题，也许有人一句话就可以帮你指出方向。</p>
          <p>但是有一点需要提前说明：我们不能保证你加入千里以后一定会变强。</p>
          <p>没有任何培训体系能够做到这一点。</p>
          <p>我们可以给你资源，给你方向，给你项目，也可以在你遇到困难的时候帮助你，但是最后真正需要把这些知识学会、把任务做出来的人，始终还是你自己。这条路总归需要自己走。</p>
          <p>我们更愿意培养一个基础普通，但是愿意主动学习、愿意交流、愿意长期投入的人，而不是一个基础很好，却始终只是把自己当成旁观者的人。</p>
        </section>

        <section>
          <h3><span>03</span>为什么不自己学？</h3>
          <p>现在想学一项技术其实比以前容易得多。网上有课程、有开源项目、有文档，也有越来越方便的 AI 工具。</p>
          <p>如果你的目标仅仅是学会 STM32、Fusion 的基础操作，ROS、RL 的运行架构或者几种主流运动控制算法，那么完全可以自己学习。</p>
          <p>但我们始终认为：与人合作、与人交流，比一个人闭门造车成长得更快，也更接近真正的工程。</p>
          <p>一个人做自己的项目时，进度慢几天，大不了自己晚几天完成。但在一个团队里，你负责的东西会真正影响别人。</p>
          <div class="recruit-letter-lines">
            <p>你的板子没有做完，整车可能不能联调；</p>
            <p>你的结构没有加工出来，后面的测试可能全部推迟；</p>
            <p>你的接口没有讲清楚，其他人就可能陪着你一起排查问题。</p>
          </div>
          <p>这时候你才会慢慢意识到：会一项技术，只是工程能力的一部分。</p>
          <p>一个真正能够承担项目的人，还需要学会沟通、规划、协作、判断和负责。</p>
          <p>所以千里并不是一个单纯教技术的地方。我们更希望你在这里经历完整的工程过程。</p>
        </section>

        <section>
          <h3><span>04</span>在千里，你会遇到很多不同的人</h3>
          <p>千里的队员来自数十个不同专业。</p>
          <p>有的人做机械，有的人做电控，有的人做视觉、算法，也有人负责运营、管理和其他工作。</p>
          <p>你会遇到比你大一两届、已经能够独立负责机器人系统的学长学姐，也会遇到和你一样刚开始接触这些东西的人。</p>
          <p>有的人后来去了企业，有的人继续做科研，有的人尝试创业。</p>
          <p>所以在这里，你学到的东西并不会只停留在机器人本身。</p>
          <p>当你开始思考以后想做什么、读研还是就业、进入什么行业、应该补哪些能力时，队伍里总会有一些已经走在前面的人愿意把自己的经历告诉你。</p>
          <p>他们不会替你决定未来应该怎么走。但至少能让你更早看到，大学之后的世界到底有哪些可能。</p>
          <h4>学会一件事情以后，你也开始承担它的责任</h4>
          <p>我们愿意把自己会的东西教给后来的人。</p>
          <p>但我们也希望，当有一天你真正学会以后，能够承担这份知识对应的责任。</p>
          <p>你需要用它完成自己的任务。有人遇到问题的时候，你愿意帮助他。下一届新人来了，你也愿意坐在当年教你的人的位置上，把自己知道的东西继续教下去。</p>
          <p>这也是战队能够一届一届走下去的原因。</p>
          <p>知识在这里不应该只是被一个人带走。它应该最终重新回到项目和团队里面。</p>
          <p>所以我们不太希望有人抱着“我来这里学点东西就走”的想法加入。你当然会得到很多东西，但与此同时，你也会逐渐开始承担责任。</p>
        </section>

        <section>
          <h3><span>05</span>我们看重什么</h3>
          <p>如果一定要说我们最希望新队员具备什么，我们最看重三件事情：责任心，沟通能力，以及长期投入的意愿。</p>
          <p>能力可以慢慢提高。很多知识也可以从零开始学。</p>
          <p>但是一个人是否认真对待自己的承诺，遇到问题以后是否愿意沟通，能不能在一件事情进入困难、重复甚至枯燥的阶段以后继续做下去，这些东西很难仅仅通过培训获得。</p>
          <p>真实工程并不总是有趣。</p>
          <p>你可能需要反复测试同一个问题，可能需要整理物资、装配零件、维护旧系统、写文档，也可能调了一整晚以后发现问题只是一个接触不良。</p>
          <p>这些事情并不会让你立刻觉得自己“学到了很多”。但它们同样是把机器人真正做出来的一部分。</p>
          <p>我们需要的是愿意承担这些事情的人。</p>
        </section>

        <section>
          <h3><span>06</span>以人为本，不意味着没有标准</h3>
          <p>千里希望成为一个尊重人、接纳人的团队。</p>
          <p>我们不会因为一个人成长慢，就轻易否定他。如果你愿意认真投入，也愿意和大家交流，我们也愿意花更多时间帮助你。</p>
          <p>但我们同样必须坦诚地告诉你：千里首先是一支战队。</p>
          <p>比赛需要结果，机器人需要有人真正承担责任，所以我们必须保持足够高的标准。</p>
          <p>如果经过一段时间的培训和实践，一个人的能力仍然无法达到对应岗位的要求，我们会和他认真沟通，也可能最终建议他退出。</p>
          <p>这并不意味着谁比谁优秀。只是每个人适合的道路不同。</p>
          <p>我们希望这种判断建立在充分尝试和相互尊重的基础上，而不是简单地把一个人划成“行”或者“不行”。</p>
        </section>

        <section>
          <h3><span>07</span>在报名之前，有一些事情必须说清楚</h3>
          <p>如果前面这些内容让你觉得很有兴趣，那么接下来这一部分反而更需要认真看。</p>
          <p>RoboMaster 是一个投入非常高的比赛。</p>
          <p>加入战队以后，你的时间分配一定不会再像以前那么自由。</p>
          <p>在实际赛季中，梯队队员每周投入二十五到三十个小时并不罕见，正式参赛队员可能需要投入四十个小时左右，而承担核心工作的成员在高强度阶段投入更多时间也是现实。</p>
          <p>这不是一个简单的强制打卡数字。我们也不会因为你某一周少在实验室坐了几个小时就判断一个人是否认真。</p>
          <p>但每个人心里需要有一杆秤。你应该知道自己承担了多少工作，自己的任务进行到了什么程度，团队现在是否在等待你的结果。</p>
          <p>承担越大的责任，也就意味着你需要主动交出越多原本属于自己的时间。</p>
          <p>你可能因此减少娱乐、活动和休息，也可能失去很多原本可以自由支配的周末。这就是选择的代价。</p>
          <p>与此同时，如果你的目标主要是综测、保研加分或者尽可能高效地获得竞赛奖项，那么我们需要非常明确地告诉你：RoboMaster 在这些方面的性价比很低。</p>
          <p>部分学院甚至并不认可这项赛事的综测或相关加分。</p>
          <p>比赛正式名额也非常有限，即使投入了一个完整赛季，也不意味着一定能够获得正式参赛名额或者纸质证书。</p>
          <p>最受关注的 RoboMaster 超级对抗赛，正式参赛队伍本身就有严格的人员名额限制。</p>
          <p>所以如果你已经非常明确地规划好了自己的大学道路，希望把主要时间投入绩点、保研、科研或者一些周期更短、获奖效率更高的比赛，那么我们甚至会认真建议你重新衡量是否适合加入 RM。</p>
          <p>不是因为这些选择不好。恰恰相反，一个知道自己想要什么的人值得尊重。</p>
          <p>只是大学的时间始终有限。</p>
          <p>我们不希望用“热血”“梦想”这样的词，让一个本来已经有清晰规划的人做出不适合自己的选择。</p>
        </section>

        <section>
          <h3><span>08</span>那为什么我们还是选择了这里？</h3>
          <p>因为对于很多留下来的人而言，RM 最后带来的东西早已经不只是一个奖项。</p>
          <p>你可能会从一个刚进入大学、习惯寻找标准答案的人，慢慢开始学会面对没有标准答案的问题。</p>
          <p>你开始知道，一个方案好不好不能只看“对不对”，还要考虑它能不能实现、什么时候能完成、成本是多少、出了问题谁来维护。</p>
          <p>你开始知道，个人能力很重要，但很多真正复杂的事情只能靠一群人共同完成。</p>
          <p>你开始真正思考：</p>
          <div class="recruit-letter-questions">
            <p>我喜欢什么？</p>
            <p>我擅长什么？</p>
            <p>我以后想成为怎样的人？</p>
          </div>
          <p>这些答案，没有人能够直接告诉你。</p>
          <p>也许认真做完一个赛季以后，你最大的收获甚至不是学会了多少软件、写了多少代码、设计了多少零件。</p>
          <p>而是你开始形成自己的判断，开始脱离高中时代不断寻找标准答案的习惯，开始真正思考自己的道路。</p>
          <blockquote>人是一根能思想的苇草。</blockquote>
          <p>我们希望一年以后，你不只是一个技术更好的学生。</p>
          <p>而是一个开始知道自己为什么做一件事情，也愿意为自己的选择承担责任的人。</p>
        </section>

        <section>
          <h3><span>09</span>最后</h3>
          <p>如果看到这里，你仍然没有确定自己到底要不要加入千里，也完全正常。</p>
          <p>事实上，我们也不希望你仅仅因为看了一封信，就立刻决定把大学里大量的时间投入这里。</p>
          <p>文字能够告诉你的终究有限。</p>
          <p>所以如果你有一点兴趣，欢迎先来实验室看看。</p>
          <p>看看我们正在做的机器人，看看实验室里真实的工作状态，也和正在这里做事的人聊一聊。</p>
          <p>你可以问技术，问比赛，问时间投入，问未来发展，也可以直接问：“你们为什么还愿意留在这里？”</p>
          <p>同时，也欢迎加入我们的招新群。</p>
          <p>关于不同方向的培训、报名流程、实验室开放安排，以及这封信没有办法回答的很多问题，我们都会在那里继续交流。</p>
          <p>千里不会替你决定大学应该怎么过。</p>
          <p>我们能做的，是把我们知道的东西、拥有的资源和走过的路尽可能摆在你面前。</p>
          <p>至于最终选择哪条路，还是由你自己决定。</p>
          <p>但如果有一天，你最终决定走进千里，我们希望和你一起，把这条路认真走下去。</p>
        </section>

        <footer class="recruit-letter-signature">
          <span>重庆大学千里战队</span>
          <a href="join.html">查看招新信息 <i class="mdi mdi-arrow-right" aria-hidden="true"></i></a>
        </footer>
      </article>
    </div>
  `;

  const closeButton = dialog.querySelector(".recruit-letter-close");
  const openLetter = () => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.documentElement.classList.add("has-recruit-letter");
  };
  const closeLetter = () => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  trigger.addEventListener("click", openLetter);
  closeButton?.addEventListener("click", closeLetter);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeLetter();
  });
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("has-recruit-letter");
    trigger.focus({ preventScroll: true });
  });
  dialog.addEventListener("cancel", () => {
    document.documentElement.classList.remove("has-recruit-letter");
  });

  document.body.append(trigger, dialog);
}

initRecruitLetter();



