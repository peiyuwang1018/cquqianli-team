const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  themeToggle?.setAttribute("aria-pressed", String(theme === "dark"));
}

applyTheme(savedTheme || preferredTheme);

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



