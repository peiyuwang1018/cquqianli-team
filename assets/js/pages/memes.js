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

  function makeWord(entry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `meme-barrage-word meme-barrage-word--${entry.tone}`;
    button.classList.toggle("is-long-term", entry.term.length >= 9);
    button.dataset.memeId = entry.id;
    button.style.setProperty("--meme-weight", entry.weight || 3);
    button.innerHTML = `<strong>${entry.term}</strong><span>${entry.hotYears.join(" / ")}</span>`;
    button.setAttribute("aria-label", `查看词条：${entry.term}`);
    return button;
  }

  function particleX(record) {
    const elapsed = Number(record.animation?.currentTime || 0) / 1000;
    return record.startX - record.speed * elapsed;
  }

  function removeRecord(state, record) {
    const lane = state.lanes[record.lane];
    lane.records = lane.records.filter((item) => item !== record);
    const count = state.activeCounts.get(record.entry.id) || 1;
    state.activeCounts.set(record.entry.id, Math.max(0, count - 1));
    record.particle.remove();
  }

  function chooseEntry(state, lane, proposedX) {
    const stageWidth = streams.clientWidth;
    const ranked = state.pool.map((entry) => {
      const activeCount = state.activeCounts.get(entry.id) || 0;
      const recentIndex = state.recent.indexOf(entry.id);
      let score = activeCount * 28 + Math.random() * 8;
      if (recentIndex >= 0) score += (state.recent.length - recentIndex) * 14;

      state.lanes.forEach((otherLane, laneIndex) => {
        otherLane.records.forEach((record) => {
          if (record.entry.id !== entry.id) return;
          const horizontalDistance = Math.abs(particleX(record) - proposedX);
          const laneDistance = Math.abs(laneIndex - lane);
          if (horizontalDistance < stageWidth * 0.5) score += 110;
          if (horizontalDistance < stageWidth * 0.3 && laneDistance < 2) score += 220;
        });
      });
      return { entry, score };
    }).sort((left, right) => left.score - right.score);

    const shortlist = ranked.slice(0, Math.min(4, ranked.length));
    const pick = shortlist[Math.floor(Math.pow(Math.random(), 1.8) * shortlist.length)] || ranked[0];
    state.recent.push(pick.entry.id);
    if (state.recent.length > Math.min(8, state.pool.length)) state.recent.shift();
    return pick.entry;
  }

  function spawnParticle(entry, state, lane, startX) {
    if (state.generation !== streamGeneration) return;

    const particle = document.createElement("div");
    particle.className = "meme-particle";
    const button = makeWord(entry);
    particle.appendChild(button);
    streams.appendChild(particle);

    const stageHeight = streams.clientHeight;
    const itemWidth = button.offsetWidth;
    const laneStep = (stageHeight - 82) / Math.max(1, state.laneCount - 1);
    const top = Math.max(12, Math.min(stageHeight - 66, 20 + lane * laneStep + state.laneJitter[lane]));
    particle.style.top = `${top}px`;
    particle.style.setProperty("--meme-tilt", `${randomBetween(-0.8, 0.8).toFixed(2)}deg`);

    if (state.reduceMotion) {
      particle.classList.add("is-static");
      particle.style.left = `${startX}px`;
      return { particle, entry, lane, width: itemWidth, startX, speed: 0, animation: null };
    }

    const speed = state.laneSpeeds[lane];
    const endX = -itemWidth - 90;
    const duration = ((startX - endX) / speed) * 1000;
    const animation = particle.animate(
      [
        { transform: `translate3d(${startX}px, 0, 0)` },
        { transform: `translate3d(${endX}px, 0, 0)` },
      ],
      { duration, easing: "linear", fill: "forwards" },
    );
    const record = { particle, entry, lane, width: itemWidth, startX, speed, animation };
    animation.addEventListener("finish", () => removeRecord(state, record));
    return record;
  }

  function addParticle(state, lane, startX) {
    const entry = chooseEntry(state, lane, startX);
    const record = spawnParticle(entry, state, lane, startX);
    state.lanes[lane].records.push(record);
    state.activeCounts.set(entry.id, (state.activeCounts.get(entry.id) || 0) + 1);
    return record;
  }

  function rightmostRecord(state, lane) {
    return state.lanes[lane].records.reduce((rightmost, record) => {
      const edge = particleX(record) + record.width;
      return !rightmost || edge > rightmost.edge ? { record, edge } : rightmost;
    }, null);
  }

  function maintainDensity(state) {
    if (state.generation !== streamGeneration || document.hidden || state.reduceMotion) return;
    const stageWidth = streams.clientWidth;
    state.lanes.forEach((_, lane) => {
      const rightmost = rightmostRecord(state, lane);
      if (rightmost && rightmost.edge > stageWidth + 70) return;
      const gap = randomBetween(72, 154);
      const startX = Math.max(stageWidth + randomBetween(55, 110), (rightmost?.edge || stageWidth) + gap);
      addParticle(state, lane, startX);
    });
  }

  function clearStream() {
    streamGeneration += 1;
    if (activeStream?.maintenanceTimer) window.clearInterval(activeStream.maintenanceTimer);
    activeStream = null;
    streams.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    streams.replaceChildren();
  }

  function renderStreams() {
    clearStream();
    const pool = visibleEntries();
    const laneCount = streams.clientHeight < 440 ? 5 : 7;
    const state = {
      generation: streamGeneration,
      pool,
      laneCount,
      laneSpeeds: Array.from({ length: laneCount }, () => randomBetween(36, 45)),
      laneJitter: Array.from({ length: laneCount }, () => randomBetween(-3, 3)),
      lanes: Array.from({ length: laneCount }, () => ({ records: [] })),
      activeCounts: new Map(pool.map((entry) => [entry.id, 0])),
      recent: [],
      reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      maintenanceTimer: 0,
    };
    activeStream = state;

    const stageWidth = streams.clientWidth;
    state.lanes.forEach((_, lane) => {
      let cursor = randomBetween(-240, 30) + (lane % 2 ? 95 : 0);
      while (cursor < stageWidth + 120) {
        const record = addParticle(state, lane, cursor);
        cursor += record.width + randomBetween(72, 154);
      }
    });
    if (!state.reduceMotion) state.maintenanceTimer = window.setInterval(() => maintainDensity(state), 360);
    summary.textContent = `已收录 ${pool.length} 条 · ${new Set(pool.flatMap((entry) => entry.hotYears)).size} 个赛季 · 解释权归集体记忆所有`;
  }

  function renderFilters() {
    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.textContent = "全部词条";
    allButton.dataset.memeYear = "all";
    allButton.classList.toggle("is-active", activeYear === "all");
    allButton.setAttribute("aria-pressed", String(activeYear === "all"));

    const picker = document.createElement("details");
    picker.className = "meme-season-picker";
    picker.classList.toggle("is-active", activeYear !== "all");
    const pickerSummary = document.createElement("summary");
    pickerSummary.innerHTML = `<span>选择赛季</span><i class="mdi mdi-chevron-down" aria-hidden="true"></i>`;
    pickerSummary.setAttribute("aria-label", activeYear === "all" ? "选择赛季" : `当前筛选：${activeYear} 赛季`);
    const menu = document.createElement("div");
    menu.className = "meme-season-menu";
    years.forEach((year) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${year} 赛季`;
      button.dataset.memeYear = year;
      button.classList.toggle("is-active", year === activeYear);
      button.setAttribute("aria-pressed", String(year === activeYear));
      menu.appendChild(button);
    });
    picker.append(pickerSummary, menu);
    filters.replaceChildren(allButton, picker);
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
    button.closest("details")?.removeAttribute("open");
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
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (activeStream?.maintenanceTimer) window.clearInterval(activeStream.maintenanceTimer);
      return;
    }
    renderStreams();
  });

  renderFilters();
  renderStreams();
})();
