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



