(() => {
  const data = window.QIANLI_ARTICLES;
  if (!data) return;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const normalize = (value) => String(value || "").trim().toLocaleLowerCase("zh-CN");

  function renderArticleIndex() {
    const grid = document.querySelector("[data-article-grid]");
    if (!grid) return;

    const search = document.querySelector("[data-article-search]");
    const sortSelect = document.querySelector("[data-article-sort]");
    const filters = [...document.querySelectorAll("[data-article-filter]")];
    const viewButtons = [...document.querySelectorAll("[data-article-view]")];
    const count = document.querySelector("[data-article-count]");
    const empty = document.querySelector("[data-article-empty]");
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    let category = data.categories.includes(requestedCategory) ? requestedCategory : "全部";
    let query = params.get("q") || "";
    let sort = params.get("sort") === "title" ? "title" : "featured";
    let view = params.get("view") === "list" ? "list" : "grid";

    if (search) search.value = query;
    if (sortSelect) sortSelect.value = sort;

    const updateUrl = () => {
      const next = new URLSearchParams();
      if (category !== "全部") next.set("category", category);
      if (query.trim()) next.set("q", query.trim());
      if (sort !== "featured") next.set("sort", sort);
      if (view !== "grid") next.set("view", view);
      const suffix = next.toString();
      history.replaceState(null, "", `${window.location.pathname}${suffix ? `?${suffix}` : ""}`);
    };

    const render = () => {
      const needle = normalize(query);
      const items = data.items.filter((item) => {
        const matchesCategory = category === "全部" || item.category === category;
        const haystack = normalize([item.title, item.summary, item.category, item.author, ...(item.keywords || [])].join(" "));
        return matchesCategory && (!needle || haystack.includes(needle));
      });

      items.sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title, "zh-CN");
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      });

      grid.innerHTML = items
        .map(
          (item) => `
            <article class="journal-card${item.featured ? " journal-card--featured" : ""}">
              <a class="journal-card-cover" href="${escapeHtml(item.url)}" aria-label="阅读《${escapeHtml(item.title)}》">
                <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.coverAlt)}" loading="lazy" />
              </a>
              <div class="journal-card-body">
                <div class="journal-card-meta">
                  <span>${escapeHtml(item.category)}</span>
                  <span>${escapeHtml(item.publishedLabel)}</span>
                </div>
                <h2><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h2>
                <p>${escapeHtml(item.summary)}</p>
                <footer>
                  <span>${escapeHtml(item.author)} · ${escapeHtml(item.readingTime)}</span>
                  <a href="${escapeHtml(item.url)}">阅读全文 <i class="mdi mdi-arrow-right" aria-hidden="true"></i></a>
                </footer>
              </div>
            </article>`,
        )
        .join("");

      filters.forEach((button) => {
        const active = button.dataset.articleFilter === category;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      viewButtons.forEach((button) => {
        const active = button.dataset.articleView === view;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      grid.classList.toggle("is-list", view === "list");
      if (count) count.textContent = `${items.length} 篇文章`;
      if (empty) empty.hidden = items.length !== 0;
      grid.hidden = items.length === 0;
      updateUrl();
    };

    filters.forEach((button) => {
      button.addEventListener("click", () => {
        category = button.dataset.articleFilter || "全部";
        render();
      });
    });
    search?.addEventListener("input", () => {
      query = search.value;
      render();
    });
    sortSelect?.addEventListener("change", () => {
      sort = sortSelect.value === "title" ? "title" : "featured";
      render();
    });
    viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        view = button.dataset.articleView === "list" ? "list" : "grid";
        render();
      });
    });
    render();
  }

  function initArticleReader() {
    const article = document.querySelector("[data-journal-article]");
    if (!article) return;

    const progress = document.querySelector("[data-reading-progress]");
    const sections = [...article.querySelectorAll("section[id]")];
    const links = [...document.querySelectorAll("[data-article-toc] a")];
    const copyButton = document.querySelector("[data-copy-article-link]");

    const updateProgress = () => {
      if (!progress) return;
      const start = article.offsetTop;
      const distance = Math.max(1, article.offsetHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      progress.style.transform = `scaleX(${ratio})`;
    };

    const setActive = (id) => {
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (current) setActive(current.target.id);
        },
        { rootMargin: "-18% 0px -67%", threshold: [0, 0.1, 0.35] },
      );
      sections.forEach((section) => observer.observe(section));
    }

    copyButton?.addEventListener("click", async () => {
      const label = copyButton.querySelector("span");
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (label) label.textContent = "链接已复制";
      } catch {
        window.prompt("复制文章链接", window.location.href);
      }
      window.setTimeout(() => {
        if (label) label.textContent = "复制链接";
      }, 1800);
    });

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
    if (sections[0]) setActive(sections[0].id);
  }

  renderArticleIndex();
  initArticleReader();
})();
