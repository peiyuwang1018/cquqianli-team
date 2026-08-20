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

  function makeWord(entry, index, interactive = true) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `meme-barrage-word meme-barrage-word--${entry.tone} meme-barrage-word--v${(index % 3) + 1}`;
    button.dataset.memeId = entry.id;
    button.style.setProperty("--meme-weight", entry.weight || 3);
    button.innerHTML = `<strong>${entry.term}</strong><span>${entry.hotYears.join(" / ")}</span>`;
    if (!interactive) {
      button.tabIndex = -1;
      button.setAttribute("aria-hidden", "true");
    } else {
      button.setAttribute("aria-label", `查看词条：${entry.term}`);
    }
    return button;
  }

  function makeSequence(pool, lane, interactive) {
    const sequence = document.createElement("div");
    sequence.className = "meme-track-sequence";
    const count = Math.max(8, pool.length * 5);
    for (let index = 0; index < count; index += 1) {
      const entry = pool[(index + lane) % pool.length];
      sequence.appendChild(makeWord(entry, index + lane, interactive));
    }
    return sequence;
  }

  function renderStreams() {
    const pool = visibleEntries();
    streams.replaceChildren();
    for (let lane = 0; lane < 4; lane += 1) {
      const viewport = document.createElement("div");
      viewport.className = "meme-stream";
      const track = document.createElement("div");
      track.className = `meme-track ${lane % 2 ? "meme-track--reverse" : ""}`;
      track.style.setProperty("--meme-duration", `${34 + lane * 7}s`);
      track.style.setProperty("--meme-delay", `${-lane * 8}s`);
      track.append(makeSequence(pool, lane, true), makeSequence(pool, lane, false));
      viewport.appendChild(track);
      streams.appendChild(viewport);
    }
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

  renderFilters();
  renderStreams();
})();
