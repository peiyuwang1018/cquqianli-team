const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let lightThemeConfirmationTimer = 0;

function applyTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  themeToggle?.setAttribute("aria-pressed", String(theme === "dark"));
}

applyTheme(savedTheme || "dark");

function setMobileNavigationOpen(open) {
  if (!navLinks || !navToggle) return;
  navLinks.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  root.classList.toggle("nav-open", open);
}

navToggle?.addEventListener("click", () => {
  setMobileNavigationOpen(!navLinks.classList.contains("is-open"));
});

function clearLightThemeConfirmation() {
  if (!themeToggle) return;
  window.clearTimeout(lightThemeConfirmationTimer);
  lightThemeConfirmationTimer = 0;
  themeToggle.classList.remove("is-light-theme-confirming");
  themeToggle.removeAttribute("aria-describedby");
}

function showLightThemeConfirmation() {
  if (!themeToggle) return;
  let bubble = themeToggle.querySelector(".theme-easter-egg-bubble");
  if (!bubble) {
    bubble = document.createElement("span");
    bubble.id = "theme-easter-egg-message";
    bubble.className = "theme-easter-egg-bubble";
    bubble.setAttribute("role", "status");
    bubble.setAttribute("aria-live", "polite");
    themeToggle.appendChild(bubble);
  }
  bubble.textContent = "白天模式太丑了。";
  themeToggle.classList.add("is-light-theme-confirming");
  themeToggle.setAttribute("aria-describedby", bubble.id);
  window.clearTimeout(lightThemeConfirmationTimer);
  lightThemeConfirmationTimer = window.setTimeout(clearLightThemeConfirmation, 2000);
}

themeToggle?.addEventListener("click", () => {
  if (root.dataset.theme !== "dark") {
    clearLightThemeConfirmation();
    applyTheme("dark");
    return;
  }

  if (themeToggle.classList.contains("is-light-theme-confirming")) {
    clearLightThemeConfirmation();
    applyTheme("light");
    return;
  }

  showLightThemeConfirmation();
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    setMobileNavigationOpen(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navLinks?.classList.contains("is-open")) {
    setMobileNavigationOpen(false);
    navToggle?.focus({ preventScroll: true });
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860 && navLinks?.classList.contains("is-open")) {
    setMobileNavigationOpen(false);
  }
});

const qrPreviewButtons = [...document.querySelectorAll("[data-qr-preview]")];
const qrLightbox = document.querySelector("[data-qr-lightbox]");
const qrLightboxImage = qrLightbox?.querySelector("[data-qr-lightbox-image]");
const qrLightboxTitle = qrLightbox?.querySelector("[data-qr-lightbox-title]");
const qrLightboxClose = qrLightbox?.querySelector("[data-qr-close]");

qrPreviewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    if (!qrLightbox || !qrLightboxImage || !image) return;
    qrLightboxImage.src = image.src;
    qrLightboxImage.alt = image.alt;
    if (qrLightboxTitle) qrLightboxTitle.textContent = button.dataset.qrTitle || image.alt;
    qrLightbox.showModal();
  });
});

qrLightboxClose?.addEventListener("click", () => qrLightbox.close());
qrLightbox?.addEventListener("click", (event) => {
  if (event.target === qrLightbox) qrLightbox.close();
});

function initBrandWordmarkFlip() {
  document.querySelectorAll(".brand-text small").forEach((wordmark) => {
    if (wordmark.querySelector(".brand-flip-inner")) return;

    const label = wordmark.textContent.trim();
    wordmark.classList.add("brand-flip");
    wordmark.innerHTML = `
      <span class="brand-flip-inner">
        <span class="brand-flip-face brand-flip-face--front">${label}</span>
        <span class="brand-flip-face brand-flip-face--back">
          <img src="assets/images/brand/千里文字logo.PNG" alt="" />
        </span>
      </span>
    `;
  });
}

initBrandWordmarkFlip();

const quoteStage = document.querySelector("[data-quote-stage]");
const quoteText = document.querySelector("[data-quote-text]");
const quoteSource = document.querySelector("[data-quote-source]");
const quoteButton = document.querySelector(".quote-random-button");
const fallbackQuotes = [{ text: "运筹帷幄，决胜千里", source: "重庆大学 千里战队" }];
const quotes = Array.isArray(window.QIANLI_QUOTES) && window.QIANLI_QUOTES.length ? window.QIANLI_QUOTES : fallbackQuotes;
const quoteRotationMs = Number(window.QIANLI_QUOTE_ROTATION_MS) || 2500;
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
  }, quoteRotationMs);
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
const gallerySeasonSelect = document.querySelector("[data-gallery-season-select]");
const galleryRobotCount = document.querySelector("[data-gallery-robot-count]");
const galleryLightboxServiceLabel = document.querySelector("[data-gallery-lightbox-service-label]");
const galleryLightboxCounter = document.querySelector("[data-gallery-lightbox-counter]");
const galleryLightboxCredit = document.querySelector("[data-gallery-lightbox-credit]");
const galleryContributorsSection = document.querySelector("[data-gallery-lightbox-contributors-section]");
const teamPhotoGallery = document.querySelector("[data-team-photo-gallery]");
const dailyPhotoGallery = document.querySelector("[data-daily-photo-gallery]");
const dailySeasonSelect = document.querySelector("[data-daily-season]");
const dailyCount = document.querySelector("[data-daily-count]");
const dailyEmpty = document.querySelector("[data-daily-empty]");
const exchangePhotoGallery = document.querySelector("[data-exchange-photo-gallery]");
const exchangeSeasonSelect = document.querySelector("[data-exchange-season]");
const exchangeCount = document.querySelector("[data-exchange-count]");
const exchangeEmpty = document.querySelector("[data-exchange-empty]");
const designPhotoGallery = document.querySelector("[data-design-photo-gallery]");
const designFilter = document.querySelector("[data-design-filter]");
const designFilterButtons = [...document.querySelectorAll("[data-design-category]")];
const competitionGallery = document.querySelector("[data-competition-gallery]");
const competitionSeasonSelect = document.querySelector("[data-competition-season]");
const competitionStageSelect = document.querySelector("[data-competition-stage]");
const competitionSourceSelect = document.querySelector("[data-competition-source]");
const competitionSceneSelect = document.querySelector("[data-competition-scene]");
const competitionCount = document.querySelector("[data-competition-count]");
const competitionProgress = document.querySelector("[data-competition-progress]");
const competitionLoadMore = document.querySelector("[data-competition-load-more]");
const competitionFooter = document.querySelector("[data-competition-footer]");
const competitionEmpty = document.querySelector("[data-competition-empty]");
const gallerySeasons = Array.isArray(window.QIANLI_GALLERY?.seasons) ? window.QIANLI_GALLERY.seasons : [];
const galleryCollections = window.QIANLI_GALLERY?.collections || {};
const competitionPhotos = Array.isArray(window.QIANLI_COMPETITION_GALLERY?.photos)
  ? window.QIANLI_COMPETITION_GALLERY.photos
  : [];
let galleryRobots = [];
let galleryRobotIndex = 0;
let galleryPhotoIndex = 0;
let filteredCompetitionPhotos = [];
let visibleCompetitionPhotos = 24;
const competitionPageSize = 24;

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

function getGalleryItemPhotos(item) {
  const fallbackPhoto = item?.photo
    ? [{
        src: item.photo,
        full: item.full,
        thumbnail: item.thumbnail,
        alt: item.alt,
        meta: item.photoMeta,
        credit: item.credit,
      }]
    : [];
  const photos = Array.isArray(item?.photos) && item.photos.length ? item.photos : fallbackPhoto;
  return photos
    .map((photo) => (typeof photo === "string" ? { src: photo } : photo))
    .filter((photo) => photo?.src);
}

function activateGalleryTab(name, moveFocus = false, historyMode = "none") {
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

  const nextHash = `#${encodeURIComponent(name)}`;
  if (historyMode !== "none" && location.hash !== nextHash) {
    try {
      if (historyMode === "replace") location.replace(nextHash);
      else location.hash = nextHash;
    } catch {
      // Keep the tab usable even when a local file browser blocks URL updates.
    }
  }

  if (moveFocus) activeTab.focus();
}

function renderGalleryLightbox(index, photoIndex = 0) {
  if (!galleryLightbox || !galleryLightboxImage) return;

  const robot = galleryRobots[index];
  const photos = getGalleryItemPhotos(robot);
  if (!robot || !photos.length) return;
  const activePhotoIndex = (photoIndex + photos.length) % photos.length;
  const activePhoto = photos[activePhotoIndex];
  const details = parseRobotRecord(robot.record);
  galleryRobotIndex = index;
  galleryPhotoIndex = activePhotoIndex;
  galleryLightboxImage.src = activePhoto.src;
  galleryLightboxImage.alt = activePhoto.alt || `${robot.title}图片`;
  if (activePhoto.full) {
    galleryLightboxImage.srcset = `${activePhoto.src} 1600w, ${activePhoto.full} 2560w`;
    galleryLightboxImage.sizes = "(max-width: 860px) calc(100vw - 48px), min(70vw, 760px)";
  } else {
    galleryLightboxImage.removeAttribute("srcset");
    galleryLightboxImage.removeAttribute("sizes");
  }
  if (galleryLightboxTitle) galleryLightboxTitle.textContent = robot.title;
  if (galleryLightboxMeta) galleryLightboxMeta.textContent = [robot.meta, activePhoto.meta].filter(Boolean).join(" · ");
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

  const hasLocalGallery = photos.length > 1;
  const hasCollectionGallery = galleryRobots.filter((item) => getGalleryItemPhotos(item).length).length > 1;
  const hasNavigation = hasLocalGallery || hasCollectionGallery;
  galleryLightbox.classList.toggle("has-navigation", hasNavigation);
  galleryPrev?.toggleAttribute("hidden", !hasNavigation);
  galleryNext?.toggleAttribute("hidden", !hasNavigation);
  if (galleryLightboxCounter) {
    galleryLightboxCounter.textContent = `${activePhotoIndex + 1} / ${photos.length}`;
    galleryLightboxCounter.hidden = !hasLocalGallery;
  }
  if (galleryLightboxCredit) {
    const credit = activePhoto.credit || robot.credit || "";
    galleryLightboxCredit.textContent = credit ? `© ${credit}` : "";
    galleryLightboxCredit.hidden = !credit;
  }

  if (!galleryLightbox.open) {
    galleryLightbox.showModal();
    document.documentElement.classList.add("has-gallery-lightbox");
  }
}

function changeGalleryRobot(offset) {
  const currentPhotos = getGalleryItemPhotos(galleryRobots[galleryRobotIndex]);
  if (currentPhotos.length > 1) {
    renderGalleryLightbox(galleryRobotIndex, galleryPhotoIndex + offset);
    return;
  }

  const photoIndexes = galleryRobots.reduce((indexes, robot, index) => {
    if (getGalleryItemPhotos(robot).length) indexes.push(index);
    return indexes;
  }, []);
  if (!photoIndexes.length) return;

  const currentPhotoIndex = photoIndexes.indexOf(galleryRobotIndex);
  const nextPhotoIndex = (currentPhotoIndex + offset + photoIndexes.length) % photoIndexes.length;
  renderGalleryLightbox(photoIndexes[nextPhotoIndex], 0);
}

function renderRobotGallery(seasonId) {
  if (!robotGallery) return;

  const season = gallerySeasons.find((item) => item.id === seasonId) || gallerySeasons[0];
  if (!season) return;

  galleryRobots = Array.isArray(season.robots) ? season.robots : [];
  if (gallerySeasonSelect) gallerySeasonSelect.value = season.id;
  if (galleryRobotCount) galleryRobotCount.textContent = `${galleryRobots.length} 台`;

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
    item.addEventListener("click", () => {
      galleryRobots = season.robots;
      renderGalleryLightbox(index, 0);
    });
    return item;
  });

  robotGallery.replaceChildren(...robotButtons);
}

function renderPhotoCollection(target, collectionName, category = "all", season = "all") {
  if (!target) return;
  const collection = Array.isArray(galleryCollections[collectionName]) ? galleryCollections[collectionName] : [];
  const photos = collection.filter((photo) => (
    (category === "all" || photo.category === category)
    && (season === "all" || photo.season === season)
  ));
  const photoButtons = photos.map((photo, index) => {
    const photoCount = getGalleryItemPhotos(photo).length;
    const item = document.createElement("button");
    item.className = "team-photo-item";
    item.type = "button";
    item.setAttribute("aria-label", `查看${photo.title}${photoCount > 1 ? `的 ${photoCount} 张照片` : "原图"}与拍摄信息`);

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

    item.append(image);
    if (photo.credit) {
      const credit = document.createElement("span");
      credit.className = "team-photo-credit";
      credit.textContent = `© ${photo.credit}`;
      item.append(credit);
    }
    if (photoCount > 1) {
      const count = document.createElement("span");
      count.className = "team-photo-count";
      count.innerHTML = `<i class="mdi mdi-image-multiple-outline" aria-hidden="true"></i>${photoCount} 张`;
      item.append(count);
    }
    item.append(caption);
    item.addEventListener("click", () => {
      galleryRobots = [photo];
      renderGalleryLightbox(0, 0);
    });
    return item;
  });
  target.replaceChildren(...photoButtons);
  return photos;
}

function initCollectionSeasonFilter({ select, target, collectionName, count, empty }) {
  if (!select || !target) return;
  const collection = Array.isArray(galleryCollections[collectionName]) ? galleryCollections[collectionName] : [];
  const seasons = [...new Set(collection.map((photo) => photo.season).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a));
  seasons.forEach((season) => {
    const option = document.createElement("option");
    option.value = season;
    option.textContent = `${season} 赛季`;
    select.append(option);
  });

  const render = () => {
    const photos = renderPhotoCollection(target, collectionName, "all", select.value || "all") || [];
    const photoCount = photos.reduce((total, photo) => total + getGalleryItemPhotos(photo).length, 0);
    if (count) count.textContent = `${photoCount} 张`;
    if (empty) empty.hidden = Boolean(photos.length);
  };

  select.addEventListener("change", render);
  render();
}

function renderCompetitionGallery() {
  if (!competitionGallery) return;

  const season = competitionSeasonSelect?.value || "all";
  const stage = competitionStageSelect?.value || "all";
  const source = competitionSourceSelect?.value || "all";
  const scene = competitionSceneSelect?.value || "all";
  filteredCompetitionPhotos = competitionPhotos.filter((photo) => (
    (season === "all" || photo.season === season)
    && (stage === "all" || photo.stage === stage)
    && (source === "all" || photo.source === source)
    && (scene === "all" || photo.scene === scene)
  ));

  const visiblePhotos = filteredCompetitionPhotos.slice(0, visibleCompetitionPhotos);
  const photoButtons = visiblePhotos.map((photo, index) => {
    const item = document.createElement("button");
    item.className = "competition-photo-item";
    item.type = "button";
    item.setAttribute("aria-label", `查看${photo.title}：${photo.sceneLabel}`);

    const image = document.createElement("img");
    image.src = photo.thumbnail;
    image.alt = photo.alt;
    image.loading = index < 8 ? "eager" : "lazy";
    image.decoding = "async";

    const caption = document.createElement("span");
    caption.className = "competition-photo-caption";
    const context = document.createElement("small");
    context.textContent = `${photo.season} · ${photo.stageLabel}`;
    const title = document.createElement("strong");
    title.textContent = photo.title;
    const sourceLabel = document.createElement("span");
    sourceLabel.textContent = photo.sourceLabel;
    caption.append(context, title, sourceLabel);

    item.append(image, caption);
    item.addEventListener("click", () => {
      galleryRobots = filteredCompetitionPhotos;
      renderGalleryLightbox(index, 0);
    });
    return item;
  });

  competitionGallery.replaceChildren(...photoButtons);
  if (competitionCount) competitionCount.textContent = `${filteredCompetitionPhotos.length} 张`;
  if (competitionProgress) competitionProgress.textContent = `已显示 ${visiblePhotos.length} / ${filteredCompetitionPhotos.length}`;
  if (competitionLoadMore) competitionLoadMore.hidden = visiblePhotos.length >= filteredCompetitionPhotos.length;
  if (competitionFooter) competitionFooter.hidden = !filteredCompetitionPhotos.length;
  if (competitionEmpty) competitionEmpty.hidden = Boolean(filteredCompetitionPhotos.length);
}

if (competitionSeasonSelect && competitionPhotos.length) {
  const seasons = [...new Set(competitionPhotos.map((photo) => photo.season))].sort((a, b) => Number(b) - Number(a));
  seasons.forEach((season) => {
    const option = document.createElement("option");
    option.value = season;
    option.textContent = `${season} 赛季`;
    competitionSeasonSelect.append(option);
  });
}

[competitionSeasonSelect, competitionStageSelect, competitionSourceSelect, competitionSceneSelect].forEach((select) => {
  select?.addEventListener("change", () => {
    visibleCompetitionPhotos = competitionPageSize;
    renderCompetitionGallery();
  });
});

competitionLoadMore?.addEventListener("click", () => {
  visibleCompetitionPhotos += competitionPageSize;
  renderCompetitionGallery();
});

renderCompetitionGallery();

if (gallerySeasonSelect && gallerySeasons.length) {
  const seasonOptions = gallerySeasons.map((season) => {
    const option = document.createElement("option");
    option.value = season.id;
    option.textContent = `${season.id} 赛季`;
    return option;
  });
  gallerySeasonSelect.replaceChildren(...seasonOptions);
  gallerySeasonSelect.addEventListener("change", () => renderRobotGallery(gallerySeasonSelect.value));
  renderRobotGallery(gallerySeasons[0].id);
}

renderPhotoCollection(teamPhotoGallery, "portraits");
initCollectionSeasonFilter({
  select: dailySeasonSelect,
  target: dailyPhotoGallery,
  collectionName: "daily",
  count: dailyCount,
  empty: dailyEmpty,
});
initCollectionSeasonFilter({
  select: exchangeSeasonSelect,
  target: exchangePhotoGallery,
  collectionName: "exchange",
  count: exchangeCount,
  empty: exchangeEmpty,
});
renderPhotoCollection(designPhotoGallery, "designs");

designFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.designCategory || "all";
    designFilterButtons.forEach((candidate) => {
      const isActive = candidate === button;
      candidate.classList.toggle("is-active", isActive);
      candidate.setAttribute("aria-pressed", String(isActive));
    });
    renderPhotoCollection(designPhotoGallery, "designs", category);
  });
});

designFilter?.addEventListener("keydown", (event) => {
  const currentIndex = designFilterButtons.indexOf(document.activeElement);
  if (currentIndex < 0) return;
  let nextIndex = null;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % designFilterButtons.length;
  if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + designFilterButtons.length) % designFilterButtons.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = designFilterButtons.length - 1;
  if (nextIndex === null) return;
  event.preventDefault();
  designFilterButtons[nextIndex].focus();
  designFilterButtons[nextIndex].click();
});

const galleryDefaultTab = galleryTabs[0]?.dataset.galleryTab || "";
const syncGalleryTabFromHash = (historyMode = "none") => {
  if (!galleryTabs.length) return;
  const requestedTab = location.hash.slice(1);
  const activeTab = galleryTabs.some((tab) => tab.dataset.galleryTab === requestedTab)
    ? requestedTab
    : galleryDefaultTab;
  activateGalleryTab(activeTab, false, historyMode);
};

galleryTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateGalleryTab(tab.dataset.galleryTab, false, "push"));
  tab.addEventListener("keydown", (event) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % galleryTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + galleryTabs.length) % galleryTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = galleryTabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    activateGalleryTab(galleryTabs[nextIndex].dataset.galleryTab, true, "push");
  });
});

if (galleryTabs.length) {
  window.addEventListener("hashchange", () => syncGalleryTabFromHash());
  syncGalleryTabFromHash("replace");
}

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
    galleryLightboxImage.removeAttribute("srcset");
    galleryLightboxImage.removeAttribute("sizes");
    galleryLightboxImage.alt = "";
  }
});

document.addEventListener("keydown", (event) => {
  if (!galleryLightbox?.open) return;
  if (event.key === "ArrowLeft") changeGalleryRobot(-1);
  if (event.key === "ArrowRight") changeGalleryRobot(1);
});

document.querySelectorAll("[data-shop-carousel]").forEach((carousel) => {
  const slides = [...carousel.querySelectorAll("[data-shop-slide]")];
  const counter = carousel.querySelector("[data-shop-counter]");
  let activeIndex = 0;

  function showShopSlide(nextIndex) {
    if (!slides.length) return;
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeIndex);
    });
    if (counter) counter.textContent = `${activeIndex + 1} / ${slides.length}`;
  }

  carousel.querySelector("[data-shop-prev]")?.addEventListener("click", () => showShopSlide(activeIndex - 1));
  carousel.querySelector("[data-shop-next]")?.addEventListener("click", () => showShopSlide(activeIndex + 1));
  showShopSlide(0);
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
      <div class="recruit-letter-body">
      <article class="recruit-letter-content">
        <div class="recruit-letter-opening">
          <p>刚进入大学的时候，很多人其实都处在一种很相似的状态 —— 自由放松了一段时间，但又开始为新的旅途感到兴奋且迷茫。</p>
          <p>高中结束了，没有既定的环境和规则让你随波逐流，没有家长或者老师日复一日地给你提要求——上了大学，在课程之外突然多出了相当多可以自己支配的时间。你可以选择参加学生组织，或是参加某一项学科竞赛，可以找到合适的创新创业项目或进到实验室课题组实习，可以花费大量的时间备考刷绩点。此外你也可以谈恋爱，可以打游戏，可以出去游山玩水，也可以什么都先体验一番。</p>
          <p>自由当然看似美好，但自由的另一面是，很多事情开始没有标准答案了。</p>
          <p>大学四年应该怎么过？以后想做什么？自己究竟擅长什么？真正喜欢什么？哪些事情值得投入大量时间？哪些事情自己愿意投入大量精力？这些问题，我们也没有办法替你回答。而 RoboMaster 更不会是这些问题的标准答案。但如果你希望自己在大学生涯中不只是上课、完成作业、考试，而是拥有突破课堂和教材、动手实践的机会，能够真正和一群志同道合的伙伴一起创造出漂亮的工程作品，那么千里战队一定是值得你了解的一个选项。</p>
          <p>在接下来的篇幅中，我们将对RoboMaster与千里战队进行详细的介绍与讲解。如果你对于参加RM比赛、加入千里战队、从事和机器人相关的技术工作感兴趣，请耐心阅读。</p>
        </div>

        <section id="recruit-letter-section-01">
          <h3><span>01</span>我们到底在做什么</h3>
          <p class="recruit-letter-lead"><strong>在我们眼中，RoboMaster 是一项独一无二的机器人竞技赛事。</strong></p>
          <p>和很多完成一个作品、提交一次答辩就结束的比赛不同，RM 的备赛周期很长。一整个赛季里，我们要自己设计、制造、调试一整套机器人系统，并最终把这些机器人送上赛场，与其他高校的机器人进行真实对抗。而这里会有机械结构、电路与嵌入式系统、控制算法、计算机视觉、通信、软件、运营管理等很多方向。但真正进入队伍以后，你会慢慢发现，我们做的事情其实很难被简单分成“机械的事情”，“电控的事情”，“视觉的事情”或者“宣运的事情”。</p>
          <p>机械改动一个结构，可能会影响电路安装；电控修改一个通信协议，可能会影响算法和视觉；机器人的重量、成本、加工条件、维护难度、比赛时间，都可能让一个理论上很好的方案最后不得不被放弃。真实工程就是这样——它很少给你一道已经写好条件、只需要求出唯一答案的题。你需要在很多约束里面不断做选择，也需要不断和别人交流、妥协、推翻自己的方案，再重新来过。</p>
          <p class="recruit-letter-closing"><strong>这也是我们认为 RoboMaster 最有价值的地方之一。</strong></p>
        </section>

        <section id="recruit-letter-section-02">
          <h3><span>02</span>我现在什么都不会，可以来吗？</h3>
          <p class="recruit-letter-lead"><strong>答案是完全可以。</strong></p>
          <p>我们当然希望你来的时候已经有一些基础。也许你写过一点代码，也许接触过机械设计，也许自己做过一些小项目。但如果这些你都没有接触过，完全并不意味着你没有机会。</p>
          <p>千里有相对完整的培训体系，有已经经历过多个赛季的老队员，也有和你们年龄相差不大的年轻队员。我们有真实的机器人项目，有固定工位、设备、加工条件和实验室，也愿意把我们已经走过的路、踩过的坑和积累下来的东西告诉后来的人——这些东西能够让一个新人工程师少走很多弯路。原本一个人可能需要几个月才能摸清楚的问题，也许有人一句话就可以帮你指出方向。</p>
          <blockquote class="recruit-letter-callout">但是有一点需要提前说明——我们不能保证你加入千里以后一定会变强。</blockquote>
          <p>没有任何培训体系能够做到这一点。我们可以给你资源，给你方向，给你项目，也可以在你遇到困难的时候帮助你，但是最后真正需要把这些知识学会、把任务做出来的人，始终还是你自己。这条路总归需要自己走。</p>
          <p>从成长的潜力来看，我们更愿意培养一个基础普通，但是愿意<strong>主动学习、交流且长期投入</strong>的人，而不是一个基础很好，却始终只是把自己当成旁观者的人。</p>
        </section>

        <section id="recruit-letter-section-03">
          <h3><span>03</span>为什么不自己学？</h3>
          <p>这个时代，想学一项技术其实比以前容易得多。网上有课程、有开源项目、有文档，也有越来越方便的 AI 工具。如果你的目标仅仅是学会 STM32、Fusion的基础操作，ROS、RL的运行架构或者几种主流运动控制算法，那么完全可以自己学习。</p>
          <blockquote class="recruit-letter-callout">但我们始终认为：与人合作、与人交流，比一个人闭门造车成长得更快，也更接近真正的工程。</blockquote>
          <p>一个人做自己的项目时，进度慢几天，大不了自己晚几天完成。但在一个团队里，你负责的东西会真正影响别人。你的板子没有做完，整车可能不能联调；你的结构没有加工出来，后面的测试可能全部推迟；你的接口没有讲清楚，其他人就可能陪着你一起排查问题。这时候你才会慢慢意识到：掌握一项技术的基础，只是工程能力的一部分而已。一个真正能够承担项目的人，还需要学会沟通、规划、协作、判断和负责。</p>
          <p class="recruit-letter-closing"><strong>所以，千里并不是一个单纯教技术的地方。我们更希望你在这里经历完整的工程项目训练的洗礼。</strong></p>
        </section>

        <section id="recruit-letter-section-04">
          <h3><span>04</span>在千里，你会遇到很多不同的人</h3>
          <p class="recruit-letter-lead"><strong>千里能给你的，不只有技术和资源，还有一群能让你看到更多可能的人。</strong></p>
          <p>千里的队员来自数十个不同专业——有的人做机械，有的人做电控，有的人做视觉和算法，也有人负责运营、管理和其他工作。你会遇到已经能够独立负责机器人系统的学长学姐，也会遇到和你一样刚刚开始接触这些东西的人。当你开始思考读研还是就业、未来想进入什么行业、应该培养哪些能力时，队伍里往往已经有人比你先走了一两步。他们不会替你决定未来应该怎么走，但会把自己的经历、判断和踩过的坑告诉你，让你更早知道大学之外还有哪些选择，也让你在真正需要做决定的时候拥有更多信息。</p>
          <p>而当你从这里学会一些东西以后，我们也希望你愿意承担起这份知识对应的责任。</p>
          <p>我们愿意把自己会的东西教给后来的人，但我们也希望，当有一天你真正学会以后，能够承担这份知识对应的责任。你需要用它完成自己的任务；有人遇到问题的时候，你愿意帮助他；下一届新人来了，你也愿意坐在当年教你的人的位置上，把自己知道的东西继续教下去。这也是战队能够一届一届走下去的原因。知识在这里不应该只是被一个人带走，而应该最终沉淀到项目和团队里面。</p>
          <p class="recruit-letter-closing"><strong>所以我们更希望，千里不是一个单纯获取技术和资源的地方，而是一个让人不断获得视野、承担责任、再把经验传递下去的环境。</strong>你会从别人身上看到更多可能，也会在这个过程中逐渐成为能够独立判断、承担事情，并对后来的人产生帮助的人。</p>
        </section>

        <section id="recruit-letter-section-05">
          <h3><span>05</span>我们看重什么</h3>
          <blockquote class="recruit-letter-callout">如果一定要说我们最希望新队员具备什么品质，答案有三：<strong>责任心，沟通能力，以及长期投入的意愿。</strong></blockquote>
          <p>能力可以慢慢提高，很多知识也可以从零开始学，但是一个人是否认真对待自己的承诺，遇到问题以后是否愿意沟通，能不能在一件事情进入困难、重复甚至枯燥的阶段以后继续做下去，这些东西很难仅仅通过培训获得。</p>
          <p>真实工程并不总是有趣。你可能需要反复测试同一个问题，可能需要整理物资、装配零件、维护旧系统、写文档，也可能调了一整晚以后发现问题只是一个接触不良。这些事情并不会让你立刻觉得自己“学到了很多”，但它们同样是把机器人真正做出来的一部分。</p>
          <p class="recruit-letter-closing"><strong>我们需要的是愿意承担这些事情的人。</strong></p>
        </section>

        <section id="recruit-letter-section-06">
          <h3><span>06</span>以人为本，不意味着没有标准</h3>
          <p>千里希望成为一个尊重人、接纳人的团队——我们不会因为一个人成长慢，就轻易否定他。如果你愿意认真投入，也愿意和大家交流，我们也愿意花更多时间帮助你。</p>
          <blockquote class="recruit-letter-callout">但我们同样必须坦诚地告诉你：<strong>千里，首先是一支代表重庆大学参加比赛的战队。</strong></blockquote>
          <p>比赛需要结果，机器人需要有人真正承担责任，所以我们必须保持足够高的标准和专业性。如果经过一段时间的培训和实践，一个人的能力仍然无法达到对应岗位的要求，我们会和他认真沟通，也可能最终建议他退出。但这并不意味着谁比谁优秀，只是每个人适合的道路不同。我们希望这种判断建立在充分尝试和相互尊重的基础上，而不是简单地把一个人划成“行”或者“不行”。</p>
        </section>

        <section id="recruit-letter-section-07">
          <h3><span>07</span>在报名之前，有一些事情必须说清楚</h3>
          <p>如果前面这些内容让你觉得很有兴趣，那么接下来这一部分反而更需要认真看。</p>
          <blockquote class="recruit-letter-callout recruit-letter-warning"><strong>RoboMaster是一个对时间精力与热情投入要求很高的比赛。</strong></blockquote>
          <p>加入战队以后，你的时间分配一定不会再像以前那么自由。在实际赛季中，梯队队员每周投入二十五到三十个小时并不罕见，正式参赛队员可能需要投入四十个小时左右，而承担核心工作的成员在高强度阶段投入更多时间也是现实。</p>
          <p>这不是一个简单的强制打卡数字，我们也不会因为你某一周少在实验室坐了几个小时就判断一个人是否认真，但每个人心里需要有一杆秤。</p>
          <p>一个合格的队员应该知道自己承担了多少工作，自己的任务进行到了什么程度，团队现在是否在等待你的结果。承担越大的责任，也就意味着你需要主动交出越多原本属于自己的时间。你可能因此减少娱乐、活动和休息，也可能失去很多原本可以自由支配的周末。</p>
          <p class="recruit-letter-closing"><strong>这就是选择的代价。</strong></p>
          <p>与此同时，如果你的目标主要是综测、保研加分或者尽可能高效地获得竞赛奖项，那么我们需要非常明确地告诉你：<strong>RoboMaster 在这些方面的性价比很低！</strong></p>
          <p>部分学院甚至并不认可这项赛事的综测或相关加分；同时，比赛的正式名额也非常有限，即使投入了一个完整赛季的时间，也不意味着你一定能够获得正式参赛名额与纸质证书。</p>
          <p>所以如果你已经非常明确地规划好了自己的大学道路，希望把主要时间投入绩点、保研、科研或者一些周期更短、获奖效率更高的比赛，那么我们甚至会认真建议你重新衡量自己是否适合加入 RM。不是因为这些选择不好——恰恰相反，一个知道自己想要什么的人更加值得尊重。</p>
          <p>大学的时间实在有限，我们不希望用“热血”“梦想”这样的词，让一个本来已经有清晰规划的人做出不适合自己的选择。</p>
        </section>

        <section id="recruit-letter-section-08">
          <h3><span>08</span>那为什么我们还是选择了这里？</h3>
          <p>因为对于很多留下来的人而言，RM 最后带来的东西早已经不只是一个奖项。</p>
          <p>在这里，你可能会从一个刚进入大学、习惯寻找标准答案的人，慢慢开始学会面对没有标准答案的问题。你开始知道，一个方案好不好不能只看“对不对”，还要考虑它能不能实现、什么时候能完成、成本是多少、出了问题谁来维护。你开始知道，个人能力很重要，但很多真正复杂的事情只能靠一群人共同完成。</p>
          <p>你开始真正思考：<strong>我喜欢什么？我擅长什么？我以后想成为怎样的人？</strong>这些答案，没有人能够直接告诉你。</p>
          <p>也许认真做完一个赛季以后，你最大的收获甚至不是学会了多少软件、写了多少代码、设计了多少零件。而是你开始形成自己的判断，开始脱离高中时代不断寻找标准答案的习惯，甚至开始怀疑大部分人所认同的既定的传统价值体系是否真的适合自己，此时，你开始真正思考属于自己的道路。</p>
          <blockquote>人是一根能思想的苇草。</blockquote>
          <p class="recruit-letter-closing"><strong>我们希望一年以后，你不只是一个技术更好的学生，而是一个开始知道自己为什么做一件事情，也愿意为自己的选择承担责任的人。</strong></p>
        </section>

        <section id="recruit-letter-section-09">
          <h3><span>09</span>最后</h3>
          <p>如果看到这里，你仍然没有确定自己到底要不要加入千里，也完全正常。事实上，我们也不希望你仅仅因为看了一封信，就立刻决定把大学里大量的时间投入这里。文字能够告诉你的终究有限。</p>
          <p>所以如果你有一点兴趣，欢迎先来实验室看看。看看我们正在做的机器人，看看实验室里真实的工作状态，也和正在这里做事的人聊一聊，你可以问技术，问比赛，问时间投入，问未来发展，也可以直接问：</p>
          <blockquote class="recruit-letter-dialogue">“你们为什么还愿意留在这里？”</blockquote>
          <p>同时，也欢迎你加入我们的招新群。关于不同方向的培训、报名流程、实验室开放安排，以及这封信没有办法回答的很多问题，我们都会在那里继续交流。</p>
          <p>千里不会替你决定大学应该怎么过。我们能做的，是把我们知道的东西、拥有的资源和走过的路尽可能摆在你面前。至于最终选择哪条路，还是由你自己决定。</p>
          <p class="recruit-letter-closing"><strong>但如果有一天，你最终决定走进千里，我们希望和你一起，把这条路认真走下去。</strong></p>
        </section>

        <footer class="recruit-letter-signature">
          <span>重庆大学千里战队</span>
          <a href="join/index.html">查看招新信息 <i class="mdi mdi-arrow-right" aria-hidden="true"></i></a>
        </footer>
      </article>
      <nav class="recruit-letter-toc" aria-label="信件目录">
        <p>目录</p>
        <ol>
          <li><button type="button" data-letter-target="recruit-letter-section-01"><span>01</span>我们到底在做什么</button></li>
          <li><button type="button" data-letter-target="recruit-letter-section-02"><span>02</span>我现在什么都不会，可以来吗？</button></li>
          <li><button type="button" data-letter-target="recruit-letter-section-03"><span>03</span>为什么不自己学？</button></li>
          <li><button type="button" data-letter-target="recruit-letter-section-04"><span>04</span>在千里，你会遇到很多不同的人</button></li>
          <li><button type="button" data-letter-target="recruit-letter-section-05"><span>05</span>我们看重什么</button></li>
          <li><button type="button" data-letter-target="recruit-letter-section-06"><span>06</span>以人为本，不意味着没有标准</button></li>
          <li><button type="button" data-letter-target="recruit-letter-section-07"><span>07</span>在报名之前，有一些事情必须说清楚</button></li>
          <li><button type="button" data-letter-target="recruit-letter-section-08"><span>08</span>那为什么我们还是选择了这里？</button></li>
          <li><button type="button" data-letter-target="recruit-letter-section-09"><span>09</span>最后</button></li>
        </ol>
      </nav>
      </div>
    </div>
  `;

  const closeButton = dialog.querySelector(".recruit-letter-close");
  const letterContent = dialog.querySelector(".recruit-letter-content");
  const tocButtons = [...dialog.querySelectorAll("[data-letter-target]")];
  const letterSections = [...dialog.querySelectorAll(".recruit-letter-content section[id]")];
  const setActiveSection = (sectionId) => {
    tocButtons.forEach((button) => {
      const isActive = button.dataset.letterTarget === sectionId;
      button.classList.toggle("is-active", isActive);
      if (isActive) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  };

  tocButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const section = dialog.querySelector(`#${button.dataset.letterTarget}`);
      if (section && letterContent) {
        const targetTop = Math.max(0, section.offsetTop - letterContent.offsetTop - 8);
        letterContent.scrollTo({
          top: targetTop,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      }
      setActiveSection(button.dataset.letterTarget);
    });
  });

  if (letterContent && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { root: letterContent, rootMargin: "-12% 0px -66%", threshold: [0, 0.15, 0.45] }
    );
    letterSections.forEach((section) => sectionObserver.observe(section));
  }

  const openLetter = () => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.documentElement.classList.add("has-recruit-letter");
    letterContent?.scrollTo({ top: 0, behavior: "auto" });
    setActiveSection("recruit-letter-section-01");
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

function initSiteStats() {
  if (document.querySelector("script[data-busuanzi-script]")) return;

  if (document.body.dataset.page === "home") {
    const panel = document.createElement("details");
    panel.className = "site-stats-panel";
    panel.dataset.siteStats = "";
    panel.setAttribute("aria-label", "当前域名访问数据");
    panel.innerHTML = `
      <summary>
        <span class="site-stats-summary-icon" aria-hidden="true">
          <i class="mdi mdi-chart-timeline-variant-shimmer"></i>
        </span>
        <span class="site-stats-summary-copy">
          <strong>站点数据</strong>
          <small data-site-stats-host></small>
        </span>
        <i class="mdi mdi-chevron-up site-stats-chevron" aria-hidden="true"></i>
      </summary>
      <div class="site-stats-grid" aria-live="polite">
        <span><strong id="busuanzi_today_pv">--</strong><small>今日浏览</small></span>
        <span><strong id="busuanzi_site_uv">--</strong><small>总访客</small></span>
        <span><strong id="busuanzi_site_pv">--</strong><small>总浏览</small></span>
      </div>
      <a class="site-stats-source" href="https://www.busuanzi.cc/" target="_blank" rel="noopener noreferrer">
        当前域名统计 · BUSUANZI
      </a>
    `;

    const hostLabel = panel.querySelector("[data-site-stats-host]");
    if (hostLabel) hostLabel.textContent = window.location.hostname || "本地预览";
    document.body.append(panel);
  }

  const script = document.createElement("script");
  script.src = "https://cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js";
  script.async = true;
  script.dataset.busuanziScript = "";
  script.addEventListener("error", () => {
    const panel = document.querySelector("[data-site-stats]");
    if (!panel) return;
    panel.classList.add("is-unavailable");
    panel.querySelectorAll(".site-stats-grid strong").forEach((value) => {
      value.textContent = "--";
    });
    const source = panel.querySelector(".site-stats-source");
    if (source) source.textContent = "统计服务暂不可用";
  });
  document.head.append(script);
}

initSiteStats();
initRecruitLetter();



