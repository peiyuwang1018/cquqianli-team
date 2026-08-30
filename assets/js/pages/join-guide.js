(() => {
  const root = document.querySelector("[data-join-video-guide]");
  const categories = Array.isArray(window.QIANLI_JOIN_VIDEO_CATEGORIES)
    ? window.QIANLI_JOIN_VIDEO_CATEGORIES.filter((category) => category?.id && Array.isArray(category.videos))
    : [];
  if (!root || !categories.length) return;

  const tabs = root.querySelector("[data-join-video-tabs]");
  const frame = root.querySelector("[data-join-video-frame]");
  const eyebrow = root.querySelector("[data-join-video-eyebrow]");
  const categoryTitle = root.querySelector("[data-join-video-category-title]");
  const categorySummary = root.querySelector("[data-join-video-category-summary]");
  const videoTag = root.querySelector("[data-join-video-tag]");
  const videoTitle = root.querySelector("[data-join-video-title]");
  const videoDescription = root.querySelector("[data-join-video-description]");
  const watchLink = root.querySelector("[data-join-video-watch]");
  const prev = root.querySelector("[data-join-video-prev]");
  const next = root.querySelector("[data-join-video-next]");
  const episodes = root.querySelector("[data-join-video-episodes]");
  let categoryIndex = 0;
  let episodeIndex = 0;

  const categoryHash = (category) => `#learn-${category.id}`;
  const categoryFromHash = () => categories.findIndex((category) => categoryHash(category) === window.location.hash);

  function externalUrl(video) {
    if (video.url) return video.url;
    if (video.bvid) return `https://www.bilibili.com/video/${video.bvid}`;
    return "";
  }

  function embedUrl(video) {
    if (video.externalOnly) return "";
    if (video.bvid) {
      const params = new URLSearchParams({
        isOutside: "true",
        bvid: video.bvid,
        p: String(video.page || 1),
        autoplay: "0",
        danmaku: "0"
      });
      return `https://player.bilibili.com/player.html?${params.toString()}`;
    }
    if (video.epId) {
      const params = new URLSearchParams({ ep_id: video.epId, autoplay: "0" });
      return `https://www.bilibili.com/blackboard/html5mobileplayer.html?${params.toString()}`;
    }
    return "";
  }

  function makeTab(category, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "tab");
    button.dataset.categoryIndex = String(index);
    button.innerHTML = `<i class="mdi ${category.icon || "mdi-play-box-multiple-outline"}" aria-hidden="true"></i><span>${category.label}</span>`;
    button.addEventListener("click", () => selectCategory(index, true));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const target = (index + direction + categories.length) % categories.length;
      selectCategory(target, true);
      tabs?.querySelector(`[data-category-index="${target}"]`)?.focus();
    });
    return button;
  }

  function makeEpisodeButton(video, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.episodeIndex = String(index);
    button.innerHTML = `<span>${String(index + 1).padStart(2, "0")} · ${video.tag || "推荐观看"}</span><strong>${video.title}</strong>${embedUrl(video) ? "" : "<small>播放链接待补充</small>"}`;
    button.addEventListener("click", () => renderEpisode(index));
    return button;
  }

  function renderEpisode(index) {
    const category = categories[categoryIndex];
    const video = category?.videos[index];
    if (!video) return;
    episodeIndex = index;
    const source = embedUrl(video);
    frame.replaceChildren();
    if (source) {
      const iframe = document.createElement("iframe");
      iframe.src = source;
      iframe.title = video.title;
      iframe.loading = "lazy";
      iframe.allow = "fullscreen; autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.setAttribute("scrolling", "no");
      iframe.setAttribute("frameborder", "0");
      frame.append(iframe);
    } else if (video.externalOnly && externalUrl(video)) {
      const external = document.createElement("a");
      external.className = "join-video-external";
      external.href = externalUrl(video);
      external.target = "_blank";
      external.rel = "noopener noreferrer";
      external.setAttribute("aria-label", `前往哔哩哔哩观看《${video.title}》`);
      external.innerHTML = '<i class="mdi mdi-play" aria-hidden="true"></i>';
      frame.append(external);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "join-video-placeholder";
      placeholder.innerHTML = '<i class="mdi mdi-link-variant-off" aria-hidden="true"></i><strong>播放链接待补充</strong><span>片目已经收录，补充准确链接后即可在这里观看。</span>';
      frame.append(placeholder);
    }

    if (videoTag) videoTag.textContent = video.tag || "推荐观看";
    if (videoTitle) videoTitle.textContent = video.title;
    if (videoDescription) videoDescription.textContent = video.description || "";
    if (watchLink) {
      const href = externalUrl(video);
      watchLink.hidden = !href;
      if (href) watchLink.href = href;
    }
    episodes?.querySelectorAll("button").forEach((button, buttonIndex) => {
      const active = buttonIndex === episodeIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function selectCategory(index, updateHash = false) {
    const category = categories[index];
    if (!category) return;
    categoryIndex = index;
    episodeIndex = 0;
    tabs?.querySelectorAll("button").forEach((button, buttonIndex) => {
      const active = buttonIndex === categoryIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    if (eyebrow) eyebrow.textContent = category.eyebrow || "ROBO­MASTER GUIDE";
    if (categoryTitle) categoryTitle.textContent = category.label;
    if (categorySummary) categorySummary.textContent = category.summary || "";
    if (episodes) {
      episodes.style.setProperty("--episode-columns", String(Math.min(category.videos.length, 4)));
      episodes.replaceChildren(...category.videos.map(makeEpisodeButton));
    }
    renderEpisode(0);
    const disabled = category.videos.length < 2;
    prev?.toggleAttribute("disabled", disabled);
    next?.toggleAttribute("disabled", disabled);
    if (updateHash && window.location.hash !== categoryHash(category)) {
      const nextUrl = `${window.location.pathname}${window.location.search}${categoryHash(category)}`;
      window.history.pushState(null, "", nextUrl);
    }
  }

  tabs?.replaceChildren(...categories.map(makeTab));
  prev?.addEventListener("click", () => {
    const videos = categories[categoryIndex].videos;
    renderEpisode((episodeIndex - 1 + videos.length) % videos.length);
  });
  next?.addEventListener("click", () => {
    const videos = categories[categoryIndex].videos;
    renderEpisode((episodeIndex + 1) % videos.length);
  });
  window.addEventListener("hashchange", () => {
    const index = categoryFromHash();
    if (index >= 0) selectCategory(index, false);
  });
  const initialIndex = categoryFromHash();
  selectCategory(initialIndex >= 0 ? initialIndex : 0, false);
})();
