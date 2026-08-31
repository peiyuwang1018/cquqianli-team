(() => {
  const calendar = window.QIANLI_SEASON_CALENDAR;
  const list = document.querySelector("[data-event-preview-list]");
  const empty = document.querySelector("[data-event-preview-empty]");
  const filters = Array.from(document.querySelectorAll("[data-event-filter]"));

  if (!calendar || !list || !filters.length) return;

  const includedCategories = new Set(["activity", "training", "festival", "other"]);
  const statusLabels = {
    confirmed: "已确认",
    tentative: "暂定",
    derived: "倒推",
    pending: "待公布",
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parseDate = (value) => new Date(`${value}T00:00:00`);
  const formatDate = (value) => {
    const date = parseDate(value);
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  };

  const formatRange = (event) => {
    if (event.start === event.end) return formatDate(event.start);
    const start = parseDate(event.start);
    const end = parseDate(event.end);
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.getFullYear()} 年 ${start.getMonth() + 1} 月 ${start.getDate()} - ${end.getDate()} 日`;
    }
    return `${formatDate(event.start)} - ${formatDate(event.end)}`;
  };

  const compactDate = (value) => {
    const date = parseDate(value);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  const compactEndDate = (event) => {
    const start = parseDate(event.start);
    const end = parseDate(event.end);
    if (start.getFullYear() !== end.getFullYear()) return compactDate(event.end);
    return `${String(end.getMonth() + 1).padStart(2, "0")}.${String(end.getDate()).padStart(2, "0")}`;
  };

  const rangeMarkup = (event) => {
    const start = `<time datetime="${escapeHtml(event.start)}">${escapeHtml(compactDate(event.start))}</time>`;
    if (event.start === event.end) return start;
    return `${start}<i aria-hidden="true">—</i><time datetime="${escapeHtml(event.end)}">${escapeHtml(compactEndDate(event))}</time>`;
  };

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const events = calendar.events
    .filter((event) => includedCategories.has(event.category) && parseDate(event.end) >= today)
    .sort((left, right) => parseDate(left.start) - parseDate(right.start));

  const render = (filter) => {
    const visible = filter === "all" ? events : events.filter((event) => event.category === filter);
    list.replaceChildren();

    visible.forEach((event) => {
      const category = calendar.categories[event.category] || {};
      const article = document.createElement("article");
      const subevents = event.subevents?.length
        ? `<div class="event-preview-subevents">${event.subevents.map((subevent) => `
            <div class="event-preview-subevent">
              <span><strong>${escapeHtml(subevent.title)}</strong><em>${escapeHtml(subevent.english)}</em></span>
              <small>${escapeHtml(subevent.dateLabel || "日期待定")}</small>
            </div>`).join("")}</div>`
        : "";
      const previewMedia = event.previewImage
        ? `<figure class="event-preview-media event-preview-media--${escapeHtml(event.previewVariant || "default")}">
            <img src="${escapeHtml(event.previewImage)}" alt="${escapeHtml(event.previewAlt || event.title)}" loading="lazy" />
          </figure>`
        : "";
      article.className = "event-preview-card";
      article.style.setProperty("--event-tone", category.color || "var(--accent)");
      article.innerHTML = `
        <div class="event-preview-date${previewMedia ? " event-preview-date--with-media" : ""}"><span class="event-preview-range" aria-label="${escapeHtml(formatRange(event))}">${rangeMarkup(event)}</span>${previewMedia}<em>${escapeHtml(statusLabels[event.status] || event.status)}</em></div>
        <div class="event-preview-copy">
          <p class="page-label"><i class="mdi ${escapeHtml(category.icon || "mdi-calendar-outline")}" aria-hidden="true"></i>${escapeHtml(category.label || "队伍活动")}</p>
          <h2>${escapeHtml(event.title)}</h2>
          <p>${escapeHtml(event.description)}</p>
          ${subevents}
          <small>信息来源：${escapeHtml(event.source || "队内规划")}</small>
        </div>`;
      list.appendChild(article);
    });

    if (empty) empty.hidden = visible.length > 0;
    filters.forEach((button) => {
      const isActive = button.dataset.eventFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  filters.forEach((button) => {
    button.addEventListener("click", () => render(button.dataset.eventFilter));
  });

  render("all");
})();
