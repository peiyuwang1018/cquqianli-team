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
  const formatPublishedDate = (value) => {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[1]}.${match[2]}.${match[3]}` : String(value || "");
  };
  const byId = (items) => new Map((items || []).map((item) => [item.id, item]));
  const isComingSoon = (item) => item?.status === "coming-soon";
  const categoryById = byId(data.categories);
  const departmentById = byId(data.departments);
  const seriesById = byId(data.series);
  const legacyCategories = new Map([
    ["千里故事", "story"],
    ["故事与随笔", "story"],
    ["赛季日志", "season-log"],
    ["工程札记", "knowledge"],
    ["开放资料", "knowledge"],
    ["知识与技术", "knowledge"],
  ]);
  const legacySeries = new Map([
    ["mechanical-group-introduction", "technical-group-introduction"],
    ["机械组导言", "technical-group-introduction"],
  ]);

  function resolveTaxonomyValue(value, items, aliases = new Map()) {
    if (!value) return "";
    if (items.some((item) => item.id === value)) return value;
    const labelMatch = items.find((item) => item.label === value);
    return labelMatch?.id || aliases.get(value) || "";
  }

  function renderArticleIndex() {
    const grid = document.querySelector("[data-article-grid]");
    if (!grid) return;

    const browser = grid.closest(".journal-browser");
    const search = document.querySelector("[data-article-search]");
    const sortSelect = document.querySelector("[data-article-sort]");
    const departmentSelect = document.querySelector("[data-article-department]");
    const departmentControl = document.querySelector("[data-article-department-control]");
    const categoryList = document.querySelector("[data-article-category-list]");
    const seriesList = document.querySelector("[data-article-series-list]");
    const tagList = document.querySelector("[data-article-tag-list]");
    const viewButtons = [...document.querySelectorAll("[data-article-view]")];
    const clearButtons = [...document.querySelectorAll("[data-article-clear]")];
    const count = document.querySelector("[data-article-count]");
    const pagination = document.querySelector("[data-article-pagination]");
    const empty = document.querySelector("[data-article-empty]");
    const params = new URLSearchParams(window.location.search);
    const knownTags = [...new Set(data.items.flatMap((item) => item.tags || []))];

    let category = resolveTaxonomyValue(params.get("category"), data.categories, legacyCategories);
    let department = resolveTaxonomyValue(params.get("department"), data.departments);
    let series = resolveTaxonomyValue(params.get("series"), data.series, legacySeries);
    let tag = knownTags.includes(params.get("tag")) ? params.get("tag") : "";
    let query = params.get("q") || "";
    const requestedSort = params.get("sort");
    let sort = requestedSort === "oldest" || requestedSort === "featured" ? requestedSort : "latest";
    let view = params.get("view") === "list" ? "list" : "grid";
    let page = Math.max(1, Number.parseInt(params.get("page"), 10) || 1);
    const pageSize = 12;

    const countFor = (dimension, value) => data.items.filter((item) => {
      if (!value) return true;
      if (dimension === "category") return item.category === value;
      if (dimension === "department") return item.departments.includes(value);
      if (dimension === "series") return item.series === value;
      if (dimension === "tag") return item.tags.includes(value);
      return false;
    }).length;

    const renderButtonList = (container, dimension, items, allLabel, prefix = "") => {
      if (!container) return;
      const options = [{ id: "", label: allLabel }, ...items];
      container.innerHTML = options.map((item) => {
        const title = item.description ? ` title="${escapeHtml(item.description)}"` : "";
        const itemPrefix = item.id ? prefix : "";
        const owners = (item.departments || []).map((id) => departmentById.get(id)).filter(Boolean);
        const countMarkup = owners.length
          ? `${owners.map((owner) => `<span class="journal-department-tag journal-department-tag--${escapeHtml(owner.tone)}">${escapeHtml(owner.label)}</span>`).join(" / ")}<b>· ${countFor(dimension, item.id)}</b>`
          : escapeHtml(countFor(dimension, item.id));
        const toneClass = dimension === "department" && item.tone ? ` class="journal-department-tag journal-department-tag--${escapeHtml(item.tone)}"` : "";
        return `<button type="button" data-article-filter-dimension="${dimension}" data-article-filter-value="${escapeHtml(item.id)}" aria-pressed="false"${title}><span${toneClass}>${itemPrefix}${escapeHtml(item.label)}</span><small>${countMarkup}</small></button>`;
      }).join("");
    };

    if (departmentSelect) {
      departmentSelect.innerHTML = [
        '<option value="">全部组别</option>',
        ...data.departments.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}（${countFor("department", item.id)}）</option>`),
      ].join("");
    }
    renderButtonList(categoryList, "category", data.categories, "全部类别");
    renderButtonList(seriesList, "series", data.series, "全部专栏");
    renderButtonList(tagList, "tag", knownTags.map((item) => ({ id: item, label: item })), "全部标签", "#");

    if (search) search.value = query;
    if (sortSelect) sortSelect.value = sort;
    if (departmentSelect) departmentSelect.value = department;

    const updateUrl = () => {
      const next = new URLSearchParams();
      if (category) next.set("category", category);
      if (department) next.set("department", department);
      if (series) next.set("series", series);
      if (tag) next.set("tag", tag);
      if (query.trim()) next.set("q", query.trim());
      if (sort !== "latest") next.set("sort", sort);
      if (view !== "grid") next.set("view", view);
      if (page > 1) next.set("page", String(page));
      const suffix = next.toString();
      history.replaceState(null, "", `${window.location.pathname}${suffix ? `?${suffix}` : ""}`);
    };

    const resetFilters = () => {
      category = "";
      department = "";
      series = "";
      tag = "";
      query = "";
      page = 1;
      if (search) search.value = "";
      if (departmentSelect) departmentSelect.value = "";
    };

    const setFilter = (dimension, value) => {
      if (dimension === "category") category = value;
      if (dimension === "department") department = value;
      if (dimension === "series") series = value;
      if (dimension === "tag") tag = value;
      page = 1;
    };

    const paginationItems = (current, total) => {
      if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
      const pages = new Set([1, total, current - 1, current, current + 1]);
      const ordered = [...pages].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b);
      return ordered.flatMap((value, index) => {
        const previous = ordered[index - 1];
        return index > 0 && value - previous > 1 ? ["ellipsis", value] : [value];
      });
    };

    const render = () => {
      const needle = normalize(query);
      const items = data.items.filter((item) => {
        const itemCategory = categoryById.get(item.category);
        const itemDepartments = item.departments.map((id) => departmentById.get(id)).filter(Boolean);
        const itemSeries = item.series ? seriesById.get(item.series) : null;
        const matchesCategory = !category || item.category === category;
        const matchesDepartment = !department || item.departments.includes(department);
        const matchesSeries = !series || item.series === series;
        const matchesTag = !tag || item.tags.includes(tag);
        const haystack = normalize([
          item.title,
          item.summary,
          item.author,
          itemCategory?.label,
          ...itemDepartments.map((entry) => entry.label),
          itemSeries?.label,
          ...(item.tags || []),
        ].join(" "));
        return matchesCategory && matchesDepartment && matchesSeries && matchesTag && (!needle || haystack.includes(needle));
      });

      items.sort((a, b) => {
        const statusOrder = Number(isComingSoon(a)) - Number(isComingSoon(b));
        if (statusOrder) return statusOrder;
        if (sort === "oldest") return String(a.publishedDate || "").localeCompare(String(b.publishedDate || ""));
        const dateOrder = String(b.publishedDate || "").localeCompare(String(a.publishedDate || ""));
        if (sort === "featured") {
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || dateOrder;
        }
        return dateOrder;
      });

      const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
      page = Math.min(page, totalPages);
      const visibleItems = items.slice((page - 1) * pageSize, page * pageSize);

      grid.innerHTML = visibleItems.map((item) => {
        const comingSoon = isComingSoon(item);
        const itemCategory = categoryById.get(item.category);
        const itemDepartments = item.departments.map((id) => departmentById.get(id)).filter(Boolean);
        const itemSeries = item.series ? seriesById.get(item.series) : null;
        const departmentTagsMarkup = itemDepartments.map((entry) => `<span class="journal-department-tag journal-department-tag--${escapeHtml(entry.tone)}">${escapeHtml(entry.label)}</span>`).join("");
        const seriesOrderMarkup = Number.isInteger(item.seriesOrder)
          ? ` <span aria-label="第 ${item.seriesOrder} 篇">· ${String(item.seriesOrder).padStart(2, "0")}</span>`
          : "";
        const seriesMarkup = itemSeries
          ? `<span class="journal-card-series"><i class="mdi mdi-bookshelf" aria-hidden="true"></i>专栏《${escapeHtml(itemSeries.label)}》${seriesOrderMarkup}</span>`
          : '<span class="journal-card-series journal-card-series--empty"><i class="mdi mdi-bookshelf" aria-hidden="true"></i>无从属专栏</span>';
        const cardClass = `journal-card${item.featured ? " journal-card--featured" : ""}${comingSoon ? " journal-card--coming-soon" : ""}`;
        const cardOpen = comingSoon
          ? `<article class="${cardClass}" aria-label="《${escapeHtml(item.title)}》即将推出">`
          : `<a class="${cardClass}" href="${escapeHtml(item.url)}" role="article" aria-label="阅读《${escapeHtml(item.title)}》">`;
        const cardClose = comingSoon ? "</article>" : "</a>";
        const dateMarkup = comingSoon
          ? '<span class="journal-card-status">即将推出</span>'
          : `<time datetime="${escapeHtml(item.publishedDate)}">${escapeHtml(formatPublishedDate(item.publishedDate))}</time>`;
        const coverReadingMarkup = comingSoon
          ? '<span class="journal-card-cover-reading"><i class="mdi mdi-progress-clock" aria-hidden="true"></i>内容筹备中</span>'
          : `<span class="journal-card-cover-reading"><i class="mdi mdi-clock-outline" aria-hidden="true"></i>${escapeHtml(item.readingTime)}</span>`;
        const inlineReadingMarkup = comingSoon
          ? '<span class="journal-card-inline-reading journal-card-inline-reading--soon" aria-label="内容筹备中"><i class="mdi mdi-progress-clock" aria-hidden="true"></i>内容筹备中</span>'
          : `<span class="journal-card-inline-reading" aria-label="阅读时长 ${escapeHtml(item.readingTime)}"><i class="mdi mdi-clock-outline" aria-hidden="true"></i>${escapeHtml(item.readingTime)}</span>`;
        return `
          ${cardOpen}
            <span class="journal-card-cover">
              <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.coverAlt)}" loading="lazy" />
              <span class="journal-card-cover-overlay" aria-hidden="true">
                <span class="journal-card-cover-summary">${escapeHtml(item.summary)}</span>
                ${coverReadingMarkup}
              </span>
            </span>
            <div class="journal-card-body">
              <div class="journal-card-meta">
                <div class="journal-card-classification">
                  <span class="journal-card-category">${escapeHtml(itemCategory?.label || item.category)}</span>
                  ${departmentTagsMarkup}
                </div>
                ${dateMarkup}
              </div>
              ${seriesMarkup}
              <h2>${escapeHtml(item.title)}</h2>
              ${inlineReadingMarkup}
            </div>
          ${cardClose}`;
      }).join("");

      if (pagination) {
        pagination.hidden = items.length === 0;
        pagination.innerHTML = `
          <button type="button" data-article-page="${Math.max(1, page - 1)}" aria-label="上一页"${page === 1 ? " disabled" : ""}><i class="mdi mdi-chevron-left" aria-hidden="true"></i></button>
          ${paginationItems(page, totalPages).map((value) => value === "ellipsis"
            ? '<span class="journal-pagination-ellipsis" aria-hidden="true">…</span>'
            : `<button class="${value === page ? "is-active" : ""}" type="button" data-article-page="${value}" aria-label="第 ${value} 页"${value === page ? ' aria-current="page"' : ""}>${value}</button>`).join("")}
          <button type="button" data-article-page="${Math.min(totalPages, page + 1)}" aria-label="下一页"${page === totalPages ? " disabled" : ""}><i class="mdi mdi-chevron-right" aria-hidden="true"></i></button>`;
      }

      document.querySelectorAll("[data-article-filter-dimension]").forEach((button) => {
        const dimension = button.dataset.articleFilterDimension;
        const current = { category, department, series, tag }[dimension];
        const active = button.dataset.articleFilterValue === current;
        button.classList.toggle("is-active", active);
        if (button.hasAttribute("aria-pressed")) button.setAttribute("aria-pressed", String(active));
      });
      viewButtons.forEach((button) => {
        const active = button.dataset.articleView === view;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      const hasFilters = Boolean(category || department || series || tag || query.trim());
      clearButtons.forEach((button) => { button.hidden = !hasFilters; });
      grid.classList.toggle("is-list", view === "list");
      if (count) {
        const publishedCount = items.filter((item) => !isComingSoon(item)).length;
        const comingSoonCount = items.length - publishedCount;
        const totalPublishedCount = data.items.filter((item) => !isComingSoon(item)).length;
        const articleCountText = hasFilters ? `${publishedCount} / ${totalPublishedCount} 篇文章` : `${publishedCount} 篇文章`;
        count.textContent = `${articleCountText}${comingSoonCount ? ` · ${comingSoonCount} 篇筹备中` : ""}`;
      }
      if (empty) empty.hidden = items.length !== 0;
      grid.hidden = items.length === 0;
      if (departmentSelect) departmentSelect.value = department;
      if (departmentControl) departmentControl.dataset.departmentTone = departmentById.get(department)?.tone || "";
      updateUrl();
    };

    browser?.addEventListener("click", (event) => {
      const filterButton = event.target.closest("[data-article-filter-dimension]");
      if (filterButton) {
        setFilter(filterButton.dataset.articleFilterDimension, filterButton.dataset.articleFilterValue || "");
        render();
        return;
      }
      const pageButton = event.target.closest("[data-article-page]");
      if (pageButton && !pageButton.disabled) {
        page = Math.max(1, Number.parseInt(pageButton.dataset.articlePage, 10) || 1);
        render();
        browser?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (event.target.closest("[data-article-clear]")) {
        resetFilters();
        render();
      }
    });
    search?.addEventListener("input", () => {
      query = search.value;
      page = 1;
      render();
    });
    sortSelect?.addEventListener("change", () => {
      sort = sortSelect.value === "oldest" || sortSelect.value === "featured" ? sortSelect.value : "latest";
      page = 1;
      render();
    });
    departmentSelect?.addEventListener("change", () => {
      department = departmentSelect.value;
      page = 1;
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
        const active = new URL(link.href, window.location.href).hash === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    links.forEach((link) => {
      const linkHash = new URL(link.href, window.location.href).hash;
      if (linkHash && document.getElementById(linkHash.slice(1))) {
        link.setAttribute("href", `${window.location.pathname}${linkHash}`);
      }

      link.addEventListener("click", (event) => {
        const targetId = new URL(link.href, window.location.href).hash.slice(1);
        const target = targetId ? document.getElementById(targetId) : null;
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${targetId}`);
        setActive(targetId);
      });
    });

    const updateActiveSection = () => {
      const activationLine = 125;
      const current = sections.reduce((match, section) => (
        section.getBoundingClientRect().top <= activationLine ? section : match
      ), sections[0]);
      if (current) setActive(current.id);
    };

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
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateProgress);
    window.addEventListener("resize", updateActiveSection);
    updateProgress();
    updateActiveSection();
  }

  renderArticleIndex();
  initArticleReader();
})();
