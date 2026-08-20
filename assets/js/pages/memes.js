(() => {
  const config = window.QIANLI_MEME_CONFIG;
  const streams = document.querySelector("[data-meme-streams]");
  const filters = document.querySelector("[data-meme-filters]");
  const randomButton = document.querySelector("[data-meme-random]");
  const summary = document.querySelector("[data-meme-summary]");
  if (!config?.entries?.length || !streams || !filters) return;

  const entries = config.entries;
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
  const years = [...new Set(entries.flatMap((entry) => entry.hotYears))].sort();
  let activeYear = "all";
  let activeEntry = null;
  let activeImage = 0;
  let returnFocus = null;
  let streamGeneration = 0;
  let activeStream = null;

  const dialog = document.createElement("dialog");
  dialog.className = "meme-dialog";
  dialog.setAttribute("aria-labelledby", "meme-dialog-title");
  dialog.innerHTML = `
    <div class="meme-dialog-shell">
      <button class="meme-dialog-close" type="button" aria-label="关闭词条档案"><i class="mdi mdi-close" aria-hidden="true"></i></button>
      <section class="meme-dialog-media" aria-label="词条图片">
        <div class="meme-dialog-image" data-meme-image></div>
        <button class="meme-image-arrow meme-image-arrow--previous" type="button" data-meme-image-previous aria-label="上一张图片"><i class="mdi mdi-chevron-left" aria-hidden="true"></i></button>
        <button class="meme-image-arrow meme-image-arrow--next" type="button" data-meme-image-next aria-label="下一张图片"><i class="mdi mdi-chevron-right" aria-hidden="true"></i></button>
        <footer class="meme-image-footer"><span data-meme-caption></span><div data-meme-dots></div></footer>
      </section>
      <article class="meme-dialog-copy">
        <header>
          <div><p class="page-label">QIANLI FIELD NOTE</p><p class="meme-dialog-season" data-meme-season></p><h2 id="meme-dialog-title" data-meme-term></h2><p class="meme-dialog-summary" data-meme-short></p></div>
          <div class="meme-entry-switcher" aria-label="切换词条">
            <button type="button" data-meme-entry-previous aria-label="上一个词条"><i class="mdi mdi-arrow-up" aria-hidden="true"></i></button>
            <button type="button" data-meme-entry-next aria-label="下一个词条"><i class="mdi mdi-arrow-down" aria-hidden="true"></i></button>
          </div>
        </header>
        <dl class="meme-definition-list">
          <div><dt>火热年份</dt><dd data-meme-years></dd></div>
          <div><dt>典故来源</dt><dd data-meme-origin></dd></div>
          <div><dt>词条释义</dt><dd data-meme-meaning></dd></div>
          <div class="meme-example"><dt>语境示例</dt><dd data-meme-example></dd></div>
        </dl>
        <p class="meme-dialog-note"><i class="mdi mdi-information-outline" aria-hidden="true"></i>${config.meta.note}</p>
      </article>
    </div>`;
  document.body.appendChild(dialog);

  const imageStage = dialog.querySelector("[data-meme-image]");
  const caption = dialog.querySelector("[data-meme-caption]");
  const dots = dialog.querySelector("[data-meme-dots]");
  const imagePrevious = dialog.querySelector("[data-meme-image-previous]");
  const imageNext = dialog.querySelector("[data-meme-image-next]");

  function visibleEntries() {
    return activeYear === "all"
      ? entries
      : entries.filter((entry) => entry.hotYears.includes(activeYear));
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  function makeWord(entry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `meme-barrage-word meme-barrage-word--${entry.tone}`;
    button.dataset.memeId = entry.id;
    button.style.setProperty("--meme-weight", entry.weight || 3);
    button.innerHTML = `<strong>${entry.term}</strong><span>${entry.hotYears.join(" / ")}</span>`;
    button.setAttribute("aria-label", `查看词条：${entry.term}`);
    return button;
  }

  function chooseLane(state) {
    const now = performance.now();
    const ranked = state.laneReady
      .map((readyAt, lane) => ({ lane, wait: Math.max(0, readyAt - now) }))
      .sort((left, right) => left.wait - right.wait);
    const bestWait = ranked[0].wait;
    const candidates = ranked.filter((item) => item.wait <= bestWait + 900).slice(0, 3);
    return candidates[Math.floor(Math.random() * candidates.length)].lane;
  }

  function scheduleParticle(entry, state, lane, targetFraction = null) {
    if (state.generation !== streamGeneration) return;

    const particle = document.createElement("div");
    particle.className = "meme-particle";
    const button = makeWord(entry);
    particle.appendChild(button);
    streams.appendChild(particle);

    const stageWidth = streams.clientWidth;
    const stageHeight = streams.clientHeight;
    const itemWidth = button.offsetWidth;
    const laneStep = (stageHeight - 88) / Math.max(1, state.laneCount - 1);
    const top = Math.max(14, Math.min(stageHeight - 70, 26 + lane * laneStep + randomBetween(-5, 5)));
    particle.style.top = `${top}px`;
    particle.style.setProperty("--meme-tilt", `${randomBetween(-0.8, 0.8).toFixed(2)}deg`);

    if (state.reduceMotion) {
      particle.classList.add("is-static");
      particle.style.left = `${Math.max(2, Math.min(82, (targetFraction ?? Math.random()) * 100))}%`;
      return;
    }

    const distance = stageWidth + itemWidth + 96;
    const speed = state.laneSpeeds[lane] * randomBetween(0.96, 1.04);
    const duration = (distance / speed) * 1000;
    const verticalDrift = randomBetween(-4, 4);
    const animation = particle.animate(
      [
        { transform: "translate3d(0, 0, 0)" },
        { transform: `translate3d(-${distance}px, ${verticalDrift}px, 0)` },
      ],
      { duration, easing: "linear", fill: "forwards" },
    );

    if (targetFraction !== null) {
      const targetX = stageWidth * targetFraction;
      const progress = Math.max(0, Math.min(0.94, (stageWidth - targetX) / distance));
      animation.currentTime = duration * progress;
    }

    const pause = () => animation.pause();
    const resume = () => animation.play();
    button.addEventListener("pointerenter", pause);
    button.addEventListener("pointerleave", resume);
    button.addEventListener("focus", pause);
    button.addEventListener("blur", resume);

    state.laneReady[lane] = performance.now() + randomBetween(2600, 4700);
    animation.addEventListener("finish", () => {
      particle.remove();
      if (state.generation !== streamGeneration) return;
      const timer = window.setTimeout(() => {
        state.timers.delete(timer);
        scheduleParticle(entry, state, chooseLane(state));
      }, randomBetween(500, 2400));
      state.timers.add(timer);
    });
  }

  function clearStream() {
    streamGeneration += 1;
    activeStream?.timers.forEach((timer) => window.clearTimeout(timer));
    activeStream = null;
    streams.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    streams.replaceChildren();
  }

  function initialLane(index, count, laneCount) {
    if (count < laneCount) {
      return Math.floor(((index + 1) * laneCount) / (count + 1));
    }
    return index % laneCount;
  }

  function renderStreams() {
    clearStream();
    const pool = shuffle(visibleEntries());
    const laneCount = 7;
    const state = {
      generation: streamGeneration,
      laneCount,
      laneReady: Array.from({ length: laneCount }, () => 0),
      laneSpeeds: Array.from({ length: laneCount }, () => randomBetween(38, 51)),
      reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches || pool.length <= 2,
      timers: new Set(),
    };
    activeStream = state;

    const columns = Math.max(1, Math.ceil(pool.length / laneCount));
    pool.forEach((entry, index) => {
      const lane = initialLane(index, pool.length, laneCount);
      const column = Math.floor(index / laneCount);
      const columnStep = 0.82 / columns;
      const stagger = lane % 2 ? columnStep * 0.5 : 0;
      const targetFraction = (0.08 + column * columnStep + stagger) % 0.9;
      scheduleParticle(entry, state, lane, targetFraction);
    });
    summary.textContent = `已收录 ${pool.length} 条 · ${new Set(pool.flatMap((entry) => entry.hotYears)).size} 个赛季 · 解释权归集体记忆所有`;
  }

  function renderFilters() {
    const options = [{ value: "all", label: "全部词条" }, ...years.map((year) => ({ value: year, label: `${year} 赛季` }))];
    filters.replaceChildren(...options.map((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.dataset.memeYear = option.value;
      button.classList.toggle("is-active", option.value === activeYear);
      button.setAttribute("aria-pressed", String(option.value === activeYear));
      return button;
    }));
  }

  function renderImage() {
    const media = activeEntry.images[activeImage];
    imageStage.replaceChildren();
    if (media.src && !media.placeholder) {
      const image = document.createElement("img");
      image.src = media.src;
      image.alt = media.alt || media.label || activeEntry.term;
      imageStage.appendChild(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "meme-image-placeholder";
      placeholder.innerHTML = `<i class="mdi mdi-image-plus-outline" aria-hidden="true"></i><strong>${media.label || "词条图片待归档"}</strong><span>IMAGE SLOT ${String(activeImage + 1).padStart(2, "0")}</span>`;
      imageStage.appendChild(placeholder);
    }
    caption.textContent = media.caption || media.label || "词条图片";
    dots.querySelectorAll("button").forEach((button, index) => {
      const active = index === activeImage;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-current", String(active));
    });
    const multiple = activeEntry.images.length > 1;
    imagePrevious.hidden = !multiple;
    imageNext.hidden = !multiple;
  }

  function renderDialog(entry) {
    activeEntry = entry;
    activeImage = 0;
    dialog.dataset.tone = entry.tone;
    dialog.classList.toggle("is-long-term", entry.term.length > 6);
    dialog.querySelector("[data-meme-season]").textContent = entry.season;
    dialog.querySelector("[data-meme-term]").textContent = entry.term;
    dialog.querySelector("[data-meme-short]").textContent = entry.summary;
    dialog.querySelector("[data-meme-years]").textContent = entry.hotYears.map((year) => `${year} 赛季`).join("、");
    dialog.querySelector("[data-meme-origin]").textContent = entry.origin;
    dialog.querySelector("[data-meme-meaning]").textContent = entry.meaning;
    dialog.querySelector("[data-meme-example]").textContent = entry.example;
    dots.replaceChildren(...entry.images.map((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `查看第 ${index + 1} 张图片`);
      button.addEventListener("click", () => {
        activeImage = index;
        renderImage();
      });
      return button;
    }));
    renderImage();
  }

  function openEntry(entry, trigger) {
    returnFocus = trigger || document.activeElement;
    renderDialog(entry);
    document.documentElement.classList.add("has-meme-dialog");
    dialog.showModal();
  }

  function moveImage(direction) {
    activeImage = (activeImage + direction + activeEntry.images.length) % activeEntry.images.length;
    renderImage();
  }

  function moveEntry(direction) {
    const pool = visibleEntries();
    const current = pool.findIndex((entry) => entry.id === activeEntry.id);
    renderDialog(pool[(current + direction + pool.length) % pool.length]);
  }

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-meme-year]");
    if (!button) return;
    activeYear = button.dataset.memeYear;
    renderFilters();
    renderStreams();
  });

  streams.addEventListener("click", (event) => {
    const button = event.target.closest("[data-meme-id]");
    const entry = button && entryMap.get(button.dataset.memeId);
    if (entry) openEntry(entry, button);
  });

  randomButton?.addEventListener("click", () => {
    const pool = visibleEntries();
    const entry = pool[Math.floor(Math.random() * pool.length)];
    openEntry(entry, randomButton);
  });

  imagePrevious.addEventListener("click", () => moveImage(-1));
  imageNext.addEventListener("click", () => moveImage(1));
  dialog.querySelector("[data-meme-entry-previous]").addEventListener("click", () => moveEntry(-1));
  dialog.querySelector("[data-meme-entry-next]").addEventListener("click", () => moveEntry(1));
  dialog.querySelector(".meme-dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveImage(-1);
    if (event.key === "ArrowRight") moveImage(1);
    if (event.key === "ArrowUp") moveEntry(-1);
    if (event.key === "ArrowDown") moveEntry(1);
  });
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("has-meme-dialog");
    returnFocus?.focus?.({ preventScroll: true });
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderStreams, 180);
  });

  renderFilters();
  renderStreams();
})();
