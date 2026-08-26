(() => {
  const readLessons = () => {
    if (window.QIANLI_TRAINING_LESSONS) return window.QIANLI_TRAINING_LESSONS;
    const node = document.querySelector("#qianli-training-data");
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch {
      return null;
    }
  };

  const resourceTabs = [...document.querySelectorAll("[data-resource-tab]")];
  const resourcePanels = [...document.querySelectorAll("[data-resource-panel]")];

  const activateResourceTab = (key, updateHash = true) => {
    resourceTabs.forEach((tab) => {
      const active = tab.dataset.resourceTab === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    resourcePanels.forEach((panel) => {
      panel.hidden = panel.dataset.resourcePanel !== key;
    });
    if (updateHash) history.replaceState(null, "", `#${key}`);
  };

  resourceTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateResourceTab(tab.dataset.resourceTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "ArrowRight" ? (index + 1) % resourceTabs.length : (index - 1 + resourceTabs.length) % resourceTabs.length;
      activateResourceTab(resourceTabs[next].dataset.resourceTab);
      resourceTabs[next].focus();
    });
  });

  if (resourceTabs.length && resourcePanels.length) {
    const initial = location.hash.replace("#", "");
    activateResourceTab(resourceTabs.some((tab) => tab.dataset.resourceTab === initial) ? initial : "training", false);
  }

  const lessons = readLessons();
  const triggers = [...document.querySelectorAll("[data-training-group]")];
  if (!lessons || !triggers.length) return;

  const dialog = document.createElement("div");
  dialog.className = "group-letter-dialog";
  dialog.hidden = true;
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "group-letter-title");
  dialog.innerHTML = `
    <article class="group-letter-shell">
      <button class="group-letter-close" type="button" aria-label="关闭组别介绍"><i class="mdi mdi-close" aria-hidden="true"></i></button>
      <div class="group-letter-content"></div>
    </article>`;
  document.body.append(dialog);

  const content = dialog.querySelector(".group-letter-content");
  const closeButton = dialog.querySelector(".group-letter-close");

  const renderList = (items, className) =>
    `<ul class="${className}">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

  const renderWork = (items = []) =>
    `<ol class="group-letter-work-list">${items.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${item}</p></li>`).join("")}</ol>`;

  const renderLesson = (lesson) => {
    if (!lesson) {
      return `
        <section class="group-letter-lesson group-letter-lesson--pending">
          <p class="page-label">LEAD-IN LESSON</p>
          <h3>先导课正在整理</h3>
          <p>这一组的先导课程会在后续资料校核完成后补充。组别详情页仍可正常查看工作方向与技术栈。</p>
        </section>`;
    }

    const gallery = lesson.images?.length
      ? `<div class="group-letter-gallery">${lesson.images
          .slice(0, 3)
          .map((src, index) => `<img src="${src}" alt="课程材料预览 ${index + 1}" loading="lazy" />`)
          .join("")}</div>`
      : "";

    return `
      <section class="group-letter-lesson">
        <p class="page-label">${lesson.eyebrow}</p>
        <h3>${lesson.title}</h3>
        <p class="group-letter-summary">${lesson.summary}</p>
        ${gallery}
        <div class="group-letter-outcome"><span>学完先导课</span><p>${lesson.outcome}</p></div>
        <div class="group-letter-columns">
          <div><h4>学习内容</h4>${renderList(lesson.topics, "group-letter-topic-list")}</div>
          <div><h4>学习节奏</h4>${renderList(lesson.stages, "group-letter-stage-list")}</div>
        </div>
        <div class="group-letter-tools">${lesson.tools.map((tool) => `<span>${tool}</span>`).join("")}</div>
        <p class="group-letter-author"><i class="mdi mdi-account-edit-outline" aria-hidden="true"></i>作者：${lesson.author}</p>
        <a class="group-letter-source" href="${lesson.pageHref}"><i class="mdi mdi-book-open-page-variant-outline" aria-hidden="true"></i> 阅读完整先导课</a>
      </section>`;
  };

  const openGroup = (key) => {
    const group = lessons[key];
    if (!group) return;
    content.innerHTML = `
      <div class="group-letter-layout">
        <figure class="group-letter-poster">
          <a href="${group.poster}" target="_blank" rel="noopener noreferrer" aria-label="查看${group.name}完整介绍海报"><img src="${group.poster}" alt="${group.name}介绍海报" /></a>
          <figcaption>© 鄢政 · 组别介绍海报</figcaption>
        </figure>
        <div class="group-letter-profile">
          <header class="group-letter-header">
            <div>
              <p class="page-label">${group.english}</p>
              <h2 id="group-letter-title">${group.name}</h2>
            </div>
            <img src="${group.icon}" alt="" aria-hidden="true" />
          </header>
          <p class="group-letter-profile-lead">${group.recruitment}</p>
          <section class="group-letter-work" aria-labelledby="group-letter-work-title">
            <p class="group-letter-kicker">WHAT YOU WILL BUILD</p>
            <h3 id="group-letter-work-title">主要工作</h3>
            ${renderWork(group.work)}
          </section>
          <section class="group-letter-training-plan" aria-labelledby="group-letter-training-title">
            <p class="group-letter-kicker">TRAINING PATH</p>
            <h3 id="group-letter-training-title">培养计划</h3>
            <p>${group.trainingPlan}</p>
            ${renderList(group.directions, "group-letter-direction-list")}
            <a class="group-letter-detail" href="${group.detailHref}">查看组别详情 <i class="mdi mdi-arrow-right" aria-hidden="true"></i></a>
          </section>
          ${renderLesson(group.lesson)}
        </div>
      </div>`;

    dialog.hidden = false;
    document.documentElement.classList.add("has-group-letter");
    closeButton.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openGroup(trigger.dataset.trainingGroup);
    });
  });

  const close = () => {
    dialog.hidden = true;
    document.documentElement.classList.remove("has-group-letter");
  };

  closeButton.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
})();
