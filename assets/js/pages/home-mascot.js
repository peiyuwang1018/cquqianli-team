(() => {
  const config = window.QIANLI_MASCOT_CONFIG;
  if (!config) return;

  const scriptUrl = new URL(document.currentScript?.src || "assets/js/pages/home-mascot.js", document.baseURI);
  const mascotImageUrl = new URL("../../images/content/home/mascot/qianli-mascot-transparent.png", scriptUrl).href;
  const blinkImageUrl = new URL("../../images/content/home/mascot/qianli-mascot-blink.png", scriptUrl).href;
  const overheatedImageUrl = new URL("../../images/content/home/mascot/qianli-mascot-overheated.png", scriptUrl).href;

  const ensureFigureLayers = (widget) => {
    const figure = widget.querySelector(".home-mascot-figure");
    if (!figure) return;

    const baseImage = figure.querySelector(".home-mascot-base") || figure.querySelector("img");
    if (baseImage) {
      baseImage.classList.add("home-mascot-base");
      baseImage.src = mascotImageUrl;
    }

    let blinkLayer = figure.querySelector(".home-mascot-blink-layer");
    if (!blinkLayer) {
      blinkLayer = document.createElement("img");
      blinkLayer.className = "home-mascot-blink-layer";
      blinkLayer.alt = "";
      blinkLayer.setAttribute("aria-hidden", "true");
      baseImage?.after(blinkLayer);
    }
    blinkLayer.src = blinkImageUrl;

    let heatLayer = figure.querySelector(".home-mascot-heat-layer");
    if (!heatLayer) {
      heatLayer = document.createElement("img");
      heatLayer.className = "home-mascot-heat-layer";
      heatLayer.alt = "";
      heatLayer.setAttribute("aria-hidden", "true");
      figure.append(heatLayer);
    }
    heatLayer.src = overheatedImageUrl;
  };

  const createWidget = () => {
    const existingWidget = document.querySelector("[data-home-mascot]");
    if (existingWidget) {
      existingWidget.querySelector("[data-home-mascot-close]")?.remove();
      ensureFigureLayers(existingWidget);
      return existingWidget;
    }

    const widget = document.createElement("aside");
    widget.className = "home-mascot-widget";
    widget.dataset.homeMascot = "";
    widget.innerHTML = `
      <div class="home-mascot-bubble" id="home-mascot-bubble" role="status" aria-live="polite" hidden data-home-mascot-bubble>
        <p class="home-mascot-message" data-home-mascot-message></p>
        <a class="home-mascot-link" href="index.html" hidden data-home-mascot-link><span data-home-mascot-link-label></span><i class="mdi mdi-arrow-right" aria-hidden="true"></i></a>
      </div>
      <button class="home-mascot-button" type="button" aria-label="听听千骊想说什么" aria-expanded="false" aria-controls="home-mascot-bubble" data-home-mascot-trigger>
        <span class="home-mascot-figure">
          <img class="home-mascot-base" src="${mascotImageUrl}" alt="" />
          <img class="home-mascot-blink-layer" src="${blinkImageUrl}" alt="" aria-hidden="true" />
          <img class="home-mascot-heat-layer" src="${overheatedImageUrl}" alt="" aria-hidden="true" />
        </span>
        <span class="home-mascot-prompt" aria-hidden="true"><span></span><span></span><span></span></span>
      </button>`;
    document.body.append(widget);
    return widget;
  };

  const normalizePath = () => decodeURIComponent(window.location.pathname).replaceAll("\\", "/").toLowerCase();
  const currentPath = normalizePath();
  const isHome = document.body.dataset.page === "home";

  const pageEntry = Object.entries(config.pages || {}).find(([path]) => currentPath.endsWith(`/${path.toLowerCase()}`));
  const sectionEntry = (config.sections || []).find((section) => currentPath.includes(section.match.toLowerCase()));
  const context = isHome
    ? config.home
    : pageEntry?.[1] || sectionEntry || config.fallback;

  const widget = createWidget();
  const trigger = widget?.querySelector("[data-home-mascot-trigger]");
  const heatLayer = widget?.querySelector(".home-mascot-heat-layer");
  const bubble = widget?.querySelector("[data-home-mascot-bubble]");
  const messageNode = widget?.querySelector("[data-home-mascot-message]");
  const link = widget?.querySelector("[data-home-mascot-link]");
  const linkLabel = widget?.querySelector("[data-home-mascot-link-label]");

  if (!widget || !trigger || !heatLayer || !bubble || !messageNode || !link || !linkLabel || !context) return;

  const messages = Array.isArray(context.messages) ? context.messages : [];
  const firstMessage = isHome ? context.first : messages[0];
  const heatConfig = {
    perClick: 22,
    threshold: 100,
    coolingPerSecond: 22,
    overheatMessage: "累死我了，不理你了。",
    ...(config.heat || {}),
  };

  let currentIndex = -1;
  let hasShownFirstMessage = false;
  let hideTimer = 0;
  let autoCloseTimer = 0;
  let heat = 0;
  let heatFrame = 0;
  let lastHeatTime = 0;
  let isOverheated = false;

  const scheduleAutoClose = () => {
    window.clearTimeout(autoCloseTimer);
    autoCloseTimer = window.setTimeout(() => closeBubble(), 3000);
  };

  const pickNextIndex = () => {
    if (messages.length < 2) return 0;
    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) nextIndex = Math.floor(Math.random() * messages.length);
    return nextIndex;
  };

  const renderItem = (item) => {
    if (!item) return;
    messageNode.textContent = item.text;
    if (item.href && item.label) {
      link.href = item.href;
      linkLabel.textContent = item.label;
      link.hidden = false;
    } else {
      link.hidden = true;
      link.removeAttribute("href");
      linkLabel.textContent = "";
    }
  };

  const renderMessage = () => {
    let item;
    if (!hasShownFirstMessage && firstMessage) {
      item = firstMessage;
      hasShownFirstMessage = true;
      currentIndex = !isHome && messages.length ? 0 : -1;
    } else {
      currentIndex = pickNextIndex();
      item = messages[currentIndex] || firstMessage;
    }
    renderItem(item);
  };

  const updateHeatVisual = () => {
    const ratio = Math.min(1, heat / heatConfig.threshold);
    heatLayer.style.opacity = ratio.toFixed(3);
  };

  const coolHeat = (now) => {
    heatFrame = 0;
    const elapsed = Math.min(0.25, (now - lastHeatTime) / 1000);
    lastHeatTime = now;
    heat = Math.max(0, heat - heatConfig.coolingPerSecond * elapsed);

    if (heat === 0 && isOverheated) {
      isOverheated = false;
      widget.classList.remove("is-overheated");
      trigger.removeAttribute("aria-disabled");
    }

    updateHeatVisual();
    if (heat > 0) heatFrame = requestAnimationFrame(coolHeat);
  };

  const beginCooling = () => {
    if (heatFrame) return;
    lastHeatTime = performance.now();
    heatFrame = requestAnimationFrame(coolHeat);
  };

  const addHeat = () => {
    heat = Math.min(heatConfig.threshold, heat + heatConfig.perClick);
    if (heat >= heatConfig.threshold) {
      isOverheated = true;
      widget.classList.add("is-overheated");
      trigger.setAttribute("aria-disabled", "true");
    }
    updateHeatVisual();
    beginCooling();
    return isOverheated;
  };

  const openBubble = () => {
    window.clearTimeout(hideTimer);
    renderMessage();
    bubble.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => bubble.classList.add("is-visible"));
    scheduleAutoClose();
  };

  const showOverheatMessage = () => {
    window.clearTimeout(hideTimer);
    renderItem({ text: heatConfig.overheatMessage });
    bubble.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => bubble.classList.add("is-visible"));
    scheduleAutoClose();
  };

  const closeBubble = ({ returnFocus = false } = {}) => {
    window.clearTimeout(hideTimer);
    window.clearTimeout(autoCloseTimer);
    bubble.classList.remove("is-visible");
    trigger.setAttribute("aria-expanded", "false");
    hideTimer = window.setTimeout(() => {
      bubble.hidden = true;
      if (returnFocus) trigger.focus();
    }, 220);
  };

  const hop = () => {
    trigger.classList.remove("is-hopping");
    void trigger.offsetWidth;
    trigger.classList.add("is-hopping");
  };

  trigger.addEventListener("click", () => {
    if (isOverheated) return;
    hop();

    if (addHeat()) {
      showOverheatMessage();
      return;
    }

    if (trigger.getAttribute("aria-expanded") === "true") {
      renderMessage();
      scheduleAutoClose();
    } else {
      openBubble();
    }
  });

  trigger.addEventListener("animationend", () => trigger.classList.remove("is-hopping"));

  document.addEventListener("pointerdown", (event) => {
    if (trigger.getAttribute("aria-expanded") === "true" && !widget.contains(event.target)) {
      closeBubble();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
      closeBubble({ returnFocus: true });
    }
  });
})();
