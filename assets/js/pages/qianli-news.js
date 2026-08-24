(() => {
  const archive = window.QIANLI_NEWS;
  if (!archive?.items?.length) return;

  const sortValue = (item) => item.type === "news" ? item.date : item.sortKey;
  const items = [...archive.items].sort((left, right) => sortValue(right).localeCompare(sortValue(left)));
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const feeds = [...document.querySelectorAll("[data-news-feed]")];
  const filterStates = new Map();
  let activeEntry = null;
  let activePool = [];
  let activeImageIndex = 0;
  let returnFocus = null;

  function formatEntryDate(value) {
    const [year, month, day] = String(value || "").split("-");
    return year && month && day ? `${year}.${month}.${day}` : "日期待核验";
  }

  function daysSinceBeijingDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const beijingParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date()).reduce((parts, part) => {
      if (part.type !== "literal") parts[part.type] = Number(part.value);
      return parts;
    }, {});
    const eventDay = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const beijingToday = Date.UTC(beijingParts.year, beijingParts.month - 1, beijingParts.day);
    return Math.max(0, Math.floor((beijingToday - eventDay) / 86400000));
  }

  function fillEntryMeta(container, entry, includeSource = false) {
    const time = document.createElement("time");
    if (entry.date) time.dateTime = entry.date;
    time.textContent = `${formatEntryDate(entry.date)} ${entry.type === "archive" ? "收录" : "发布"}`;
    const details = [entry.dateLabel, entry.category];
    if (includeSource) details.push(entry.sourceLabel);
    const nodes = [time, document.createTextNode(` · ${details.join(" · ")}`)];
    if (entry.type === "archive") {
      const elapsedDays = daysSinceBeijingDate(entry.date);
      if (elapsedDays !== null) {
        const elapsed = document.createElement("span");
        elapsed.className = "news-entry-relative-days";
        elapsed.textContent = `距今 ${elapsedDays} 天`;
        elapsed.title = "按北京时间自然日计算";
        nodes.push(elapsed);
      }
    }
    container.replaceChildren(...nodes);
  }

  const dialog = document.createElement("dialog");
  dialog.className = "news-entry-dialog";
  dialog.setAttribute("aria-labelledby", "news-entry-dialog-title");
  dialog.innerHTML = `
    <div class="news-entry-dialog-shell">
      <div class="news-entry-dialog-controls">
        <button type="button" data-news-previous aria-label="上一篇"><i class="mdi mdi-arrow-up" aria-hidden="true"></i></button>
        <button type="button" data-news-next aria-label="下一篇"><i class="mdi mdi-arrow-down" aria-hidden="true"></i></button>
        <button class="news-entry-dialog-close" type="button" data-news-close aria-label="关闭详情"><i class="mdi mdi-close" aria-hidden="true"></i></button>
      </div>
      <figure class="news-entry-dialog-media">
        <img data-news-dialog-image alt="" />
        <button class="news-entry-dialog-media-nav news-entry-dialog-media-nav--previous" type="button" data-news-image-previous aria-label="上一张图片"><i class="mdi mdi-chevron-left" aria-hidden="true"></i></button>
        <button class="news-entry-dialog-media-nav news-entry-dialog-media-nav--next" type="button" data-news-image-next aria-label="下一张图片"><i class="mdi mdi-chevron-right" aria-hidden="true"></i></button>
        <div class="news-entry-dialog-media-dots" data-news-image-dots aria-label="图片分页"></div>
        <figcaption data-news-dialog-caption></figcaption>
      </figure>
      <article class="news-entry-dialog-copy">
        <header>
          <p class="page-label" data-news-dialog-kind></p>
          <p class="news-entry-dialog-meta" data-news-dialog-meta></p>
          <h2 id="news-entry-dialog-title" data-news-dialog-title></h2>
          <p class="news-entry-dialog-summary" data-news-dialog-summary></p>
        </header>
        <div class="news-entry-dialog-body" data-news-dialog-body></div>
        <dl class="news-entry-dialog-facts" data-news-dialog-facts></dl>
        <footer class="news-entry-dialog-footer">
          <span data-news-dialog-status></span>
          <div data-news-dialog-actions></div>
        </footer>
      </article>
    </div>`;
  document.body.appendChild(dialog);

  function createCard(entry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `news-record-card news-record-card--${entry.type}`;
    button.dataset.newsId = entry.id;
    button.setAttribute("aria-haspopup", "dialog");

    const media = document.createElement("span");
    media.className = "news-record-card-media";
    const image = document.createElement("img");
    image.src = entry.thumbnail || entry.image;
    image.alt = entry.imageAlt || "";
    image.loading = "lazy";
    image.decoding = "async";
    media.appendChild(image);

    const copy = document.createElement("span");
    copy.className = "news-record-card-copy";
    const meta = document.createElement("span");
    meta.className = "news-record-card-meta";
    fillEntryMeta(meta, entry);
    const title = document.createElement("strong");
    title.textContent = entry.title;
    const summary = document.createElement("span");
    summary.className = "news-record-card-summary";
    summary.textContent = entry.summary;
    const footer = document.createElement("span");
    footer.className = "news-record-card-footer";
    footer.innerHTML = `<span>${entry.sourceLabel}</span><span>展开词条 <i class="mdi mdi-arrow-top-right" aria-hidden="true"></i></span>`;
    copy.append(meta, title, summary, footer);
    button.append(media, copy);
    return button;
  }

  function createEmptyState(type) {
    const empty = document.createElement("div");
    empty.className = "news-record-empty";
    empty.innerHTML = `<i class="mdi ${type === "archive" ? "mdi-archive-clock-outline" : "mdi-newspaper-variant-outline"}" aria-hidden="true"></i><div><strong>该筛选下暂未收录条目</strong><span>后续内容会继续写入同一份要闻档案。</span></div>`;
    return empty;
  }

  function getFilterState(type) {
    return filterStates.get(type) || { value: "全部", mode: "category" };
  }

  function entriesFor(type) {
    const state = getFilterState(type);
    return items.filter((item) => {
      if (item.type !== type || state.value === "全部") return item.type === type;
      return state.mode === "season" ? item.season === state.value : item.category === state.value;
    });
  }

  function renderType(type) {
    const pool = entriesFor(type);
    feeds.filter((feed) => feed.dataset.newsType === type).forEach((feed) => {
      const limit = Number(feed.dataset.newsLimit || 0);
      const visible = limit > 0 ? pool.slice(0, limit) : pool;
      feed.replaceChildren(...(visible.length ? visible.map(createCard) : [createEmptyState(type)]));
    });
    document.querySelectorAll(`[data-news-count="${type}"]`).forEach((counter) => {
      counter.textContent = `${pool.length} 条记录`;
    });
  }

  function makeAction(url, label, external = false) {
    const link = document.createElement("a");
    link.href = url;
    link.className = "news-entry-dialog-action";
    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    link.innerHTML = `<span>${label}</span><i class="mdi ${external ? "mdi-open-in-new" : "mdi-arrow-right"}" aria-hidden="true"></i>`;
    return link;
  }

  function entryImages(entry) {
    if (Array.isArray(entry.images) && entry.images.length) return entry.images;
    return [{
      src: entry.image,
      alt: entry.imageAlt || entry.title,
      caption: entry.imageAlt || entry.title,
      fit: entry.imageFit,
      position: entry.imagePosition,
    }];
  }

  function renderEntryImage(entry, index = 0) {
    const pool = entryImages(entry);
    activeImageIndex = (index + pool.length) % pool.length;
    const current = pool[activeImageIndex];
    const image = dialog.querySelector("[data-news-dialog-image]");
    image.src = current.src;
    image.alt = current.alt || entry.imageAlt || entry.title;
    image.style.objectFit = current.fit || entry.imageFit || "";
    image.style.objectPosition = current.position || entry.imagePosition || "";
    dialog.querySelector("[data-news-dialog-caption]").textContent = current.caption || current.alt || entry.imageAlt || entry.title;

    const multiple = pool.length > 1;
    dialog.querySelector("[data-news-image-previous]").hidden = !multiple;
    dialog.querySelector("[data-news-image-next]").hidden = !multiple;
    const dots = dialog.querySelector("[data-news-image-dots]");
    dots.hidden = !multiple;
    dots.replaceChildren(...pool.map((_, dotIndex) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `查看第 ${dotIndex + 1} 张图片`);
      dot.setAttribute("aria-current", String(dotIndex === activeImageIndex));
      dot.addEventListener("click", () => renderEntryImage(entry, dotIndex));
      return dot;
    }));
  }

  function renderDialog(entry) {
    activeEntry = entry;
    dialog.dataset.newsType = entry.type;
    renderEntryImage(entry);
    dialog.querySelector("[data-news-dialog-kind]").textContent = entry.type === "news" ? "QIANLI NEWS" : "ARCHIVE RECORD";
    fillEntryMeta(dialog.querySelector("[data-news-dialog-meta]"), entry, true);
    dialog.querySelector("[data-news-dialog-title]").textContent = entry.title;
    dialog.querySelector("[data-news-dialog-summary]").textContent = entry.summary;

    const body = dialog.querySelector("[data-news-dialog-body]");
    body.replaceChildren(...entry.paragraphs.map((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      return element;
    }));

    const facts = dialog.querySelector("[data-news-dialog-facts]");
    facts.replaceChildren(...entry.facts.flatMap(([term, description]) => {
      const wrapper = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = description;
      wrapper.append(dt, dd);
      return [wrapper];
    }));

    dialog.querySelector("[data-news-dialog-status]").textContent = entry.type === "archive" ? `故事状态：${entry.status}` : entry.status;
    const actions = dialog.querySelector("[data-news-dialog-actions]");
    const links = [makeAction(entry.primaryUrl, entry.primaryLabel, entry.external)];
    if (entry.storyUrl) links.push(makeAction(entry.storyUrl, entry.storyLabel));
    actions.replaceChildren(...links);
  }

  function openEntry(entry, trigger, pool) {
    returnFocus = trigger || document.activeElement;
    activePool = pool?.length ? pool : items.filter((item) => item.type === entry.type);
    renderDialog(entry);
    document.documentElement.classList.add("has-news-dialog");
    if (!dialog.open) dialog.showModal();
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${entry.id}`);
  }

  function moveEntry(direction) {
    if (!activeEntry || !activePool.length) return;
    const current = activePool.findIndex((item) => item.id === activeEntry.id);
    renderDialog(activePool[(current + direction + activePool.length) % activePool.length]);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${activeEntry.id}`);
  }

  function moveEntryImage(direction) {
    if (!activeEntry) return;
    renderEntryImage(activeEntry, activeImageIndex + direction);
  }

  document.addEventListener("click", (event) => {
    const filter = event.target.closest("[data-news-filter]");
    if (filter) {
      const type = filter.dataset.newsFilterType;
      filterStates.set(type, { value: filter.dataset.newsFilter, mode: filter.dataset.newsFilterMode || "category" });
      document.querySelectorAll(`[data-news-filter-type="${type}"]`).forEach((button) => {
        const active = button === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      renderType(type);
      return;
    }

    const card = event.target.closest("[data-news-id]");
    if (!card) return;
    const entry = itemMap.get(card.dataset.newsId);
    if (entry) openEntry(entry, card, entriesFor(entry.type));
  });

  dialog.querySelector("[data-news-close]").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-news-previous]").addEventListener("click", () => moveEntry(-1));
  dialog.querySelector("[data-news-next]").addEventListener("click", () => moveEntry(1));
  dialog.querySelector("[data-news-image-previous]").addEventListener("click", () => moveEntryImage(-1));
  dialog.querySelector("[data-news-image-next]").addEventListener("click", () => moveEntryImage(1));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") moveEntry(-1);
    if (event.key === "ArrowDown") moveEntry(1);
    if (event.key === "ArrowLeft") moveEntryImage(-1);
    if (event.key === "ArrowRight") moveEntryImage(1);
  });
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("has-news-dialog");
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    returnFocus?.focus?.({ preventScroll: true });
  });

  feeds.forEach((feed) => renderType(feed.dataset.newsType));

  const hashEntry = itemMap.get(window.location.hash.slice(1));
  if (hashEntry) openEntry(hashEntry, null, entriesFor(hashEntry.type));
})();
