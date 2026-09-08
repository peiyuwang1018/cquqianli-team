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
      <button class="home-mascot-button" type="button" aria-label="听听千璃想说什么" aria-expanded="false" aria-controls="home-mascot-bubble" data-home-mascot-trigger>
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
  const autoPrompt = context.autoPrompt && typeof context.autoPrompt === "object" ? context.autoPrompt : null;
  const autoTarget = autoPrompt?.target ? document.querySelector(autoPrompt.target) : null;
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
  let autoPromptTimer = 0;
  let pointerFrame = 0;

  const autoVisibleMs = Math.max(1000, Number(autoPrompt?.visibleMs) || 4000);
  const autoHiddenMs = Math.max(1000, Number(autoPrompt?.hiddenMs) || 6000);
  const targetPointer = autoTarget
    ? (() => {
        const pointer = document.createElement("div");
        pointer.className = "home-mascot-target-pointer";
        pointer.hidden = true;
        pointer.setAttribute("aria-hidden", "true");
        pointer.innerHTML = `
          <svg viewBox="0 0 ${window.innerWidth} ${window.innerHeight}" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker id="home-mascot-pointer-head" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="strokeWidth">
                <path d="M 0 0 L 9 4.5 L 0 9 z" fill="currentColor"></path>
              </marker>
            </defs>
            <path data-home-mascot-pointer-path marker-end="url(#home-mascot-pointer-head)" vector-effect="non-scaling-stroke"></path>
          </svg>`;
        document.body.append(pointer);
        return pointer;
      })()
    : null;
  const targetPointerSvg = targetPointer?.querySelector("svg");
  const targetPointerPath = targetPointer?.querySelector("[data-home-mascot-pointer-path]");

  const isTargetInViewport = () => {
    if (!autoTarget) return false;
    const rect = autoTarget.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
  };

  const updateTargetPointer = () => {
    pointerFrame = 0;
    if (!targetPointer || !targetPointerSvg || !targetPointerPath || targetPointer.hidden || !isTargetInViewport()) {
      targetPointer?.classList.remove("is-visible");
      return;
    }

    const bubbleRect = bubble.getBoundingClientRect();
    const targetRect = autoTarget.getBoundingClientRect();
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const bubbleCenterX = bubbleRect.left + bubbleRect.width / 2;
    const targetIsAbove = targetCenterY < bubbleRect.top;
    const targetIsLeft = targetCenterX < bubbleCenterX;
    const startX = targetIsAbove ? bubbleCenterX : targetIsLeft ? bubbleRect.left : bubbleRect.right;
    const startY = targetIsAbove ? bubbleRect.top : bubbleRect.top + bubbleRect.height * 0.48;
    const endX = targetCenterX;
    const endY = targetIsAbove ? targetRect.bottom + 5 : targetRect.top - 5;
    const controlX = startX + (endX - startX) * 0.42;
    const controlY = startY + (endY - startY) * 0.28;

    targetPointerSvg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
    targetPointerPath.setAttribute("d", `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`);
    targetPointer.classList.add("is-visible");
  };

  const requestTargetPointerUpdate = () => {
    if (!pointerFrame && targetPointer && !targetPointer.hidden) pointerFrame = requestAnimationFrame(updateTargetPointer);
  };

  const showTargetPointer = () => {
    if (!targetPointer) return;
    targetPointer.hidden = false;
    requestAnimationFrame(() => {
      updateTargetPointer();
      requestAnimationFrame(() => targetPointer.classList.add("is-visible"));
    });
  };

  const hideTargetPointer = () => {
    if (!targetPointer) return;
    targetPointer.classList.remove("is-visible");
    targetPointer.hidden = true;
  };

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
    hideTargetPointer();
    bubble.classList.remove("is-visible");
    trigger.setAttribute("aria-expanded", "false");
    hideTimer = window.setTimeout(() => {
      bubble.hidden = true;
      if (returnFocus) trigger.focus();
    }, 220);
  };

  const scheduleAutoPrompt = (delay = autoHiddenMs) => {
    if (!autoPrompt || !autoTarget) return;
    window.clearTimeout(autoPromptTimer);
    autoPromptTimer = window.setTimeout(showAutoPrompt, delay);
  };

  const showAutoPrompt = () => {
    autoPromptTimer = 0;
    if (document.hidden || document.querySelector("dialog[open]") || !isTargetInViewport()) {
      scheduleAutoPrompt(1000);
      return;
    }

    window.clearTimeout(hideTimer);
    window.clearTimeout(autoCloseTimer);
    renderItem({ text: autoPrompt.text });
    bubble.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => {
      bubble.classList.add("is-visible");
      showTargetPointer();
    });

    autoPromptTimer = window.setTimeout(() => {
      autoPromptTimer = 0;
      closeBubble();
      scheduleAutoPrompt(autoHiddenMs);
    }, autoVisibleMs);
  };

  const deferAutoPrompt = (delay = autoHiddenMs) => {
    if (!autoPrompt || !autoTarget) return;
    window.clearTimeout(autoPromptTimer);
    autoPromptTimer = 0;
    hideTargetPointer();
    scheduleAutoPrompt(delay);
  };

  const hop = () => {
    trigger.classList.remove("is-hopping");
    void trigger.offsetWidth;
    trigger.classList.add("is-hopping");
  };

  trigger.addEventListener("click", () => {
    deferAutoPrompt();
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
      deferAutoPrompt();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
      closeBubble({ returnFocus: true });
      deferAutoPrompt();
    }
  });

  window.addEventListener("resize", requestTargetPointerUpdate);
  window.addEventListener("scroll", requestTargetPointerUpdate, true);
  document.addEventListener("visibilitychange", () => {
    window.clearTimeout(autoPromptTimer);
    autoPromptTimer = 0;
    if (document.hidden) closeBubble();
    else scheduleAutoPrompt(0);
  });

  scheduleAutoPrompt(0);
})();
