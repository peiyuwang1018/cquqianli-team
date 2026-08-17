(() => {
  const config = window.QIANLI_ORGANIZATION;
  const root = document.querySelector("[data-organization-map]");
  if (!config || !root) return;

  const tabs = root.querySelector("[data-organization-tabs]");
  const heading = root.querySelector("[data-organization-heading]");
  const eyebrow = root.querySelector("[data-organization-eyebrow]");
  const description = root.querySelector("[data-organization-description]");
  const stage = root.querySelector("[data-organization-stage]");
  const context = root.querySelector("[data-organization-context]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeView = config.defaultView;
  let switching = false;

  function createTag(tag) {
    const element = document.createElement("span");
    element.className = "org-card-tag";
    element.textContent = tag;
    return element;
  }

  function createCard(card) {
    const article = document.createElement("article");
    article.className = "org-card";
    article.tabIndex = 0;
    if (card.variant) article.classList.add(`org-card--${card.variant}`);
    if (card.tone) article.classList.add(`org-card--tone-${card.tone}`);

    const head = document.createElement("div");
    head.className = "org-card-head";

    const title = document.createElement("h3");
    title.textContent = card.title;
    head.appendChild(title);

    if (card.meta) {
      const meta = document.createElement("span");
      meta.textContent = card.meta;
      head.appendChild(meta);
    }

    article.appendChild(head);

    if (card.childUnits?.length) {
      const childUnits = document.createElement("div");
      childUnits.className = "org-child-units";
      card.childUnits.forEach((unit) => childUnits.appendChild(createTag(unit)));
      article.appendChild(childUnits);
    }

    if (card.sections?.length) {
      const sections = document.createElement("div");
      sections.className = "org-management-sections";
      card.sections.forEach((section) => {
        const block = document.createElement("div");
        const label = document.createElement("strong");
        label.textContent = section.label;
        const tagList = document.createElement("div");
        tagList.className = "org-card-tags";
        section.tags.forEach((tag) => tagList.appendChild(createTag(tag)));
        block.append(label, tagList);
        sections.appendChild(block);
      });
      article.appendChild(sections);
    } else if (card.tags?.length) {
      const tagList = document.createElement("div");
      tagList.className = "org-card-tags";
      card.tags.forEach((tag) => tagList.appendChild(createTag(tag)));
      article.appendChild(tagList);
    }

    const detail = document.createElement("p");
    detail.className = "org-card-detail";
    detail.textContent = card.description;
    article.appendChild(detail);

    const showContext = () => {
      stage.classList.add("has-focus");
      article.classList.add("is-focused");
      context.replaceChildren();
      const contextTitle = document.createElement("strong");
      contextTitle.textContent = card.title;
      const contextText = document.createElement("span");
      contextText.textContent = card.description;
      context.append(contextTitle, contextText);
    };

    const clearContext = () => {
      stage.classList.remove("has-focus");
      article.classList.remove("is-focused");
      setDefaultContext(config.views[activeView]);
    };

    article.addEventListener("mouseenter", showContext);
    article.addEventListener("mouseleave", clearContext);
    article.addEventListener("focus", showContext);
    article.addEventListener("blur", clearContext);
    return article;
  }

  function createLane(lane) {
    const section = document.createElement("section");
    section.className = "org-lane";

    const label = document.createElement("div");
    label.className = "org-lane-label";
    const number = document.createElement("span");
    number.textContent = lane.number;
    const copy = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = lane.title;
    const note = document.createElement("p");
    note.textContent = lane.note;
    copy.append(title, note);
    label.append(number, copy);

    const track = document.createElement("div");
    track.className = `org-lane-track org-lane-track--${lane.layout || "auto"}`;
    lane.cards.forEach((card) => track.appendChild(createCard(card)));

    section.append(label, track);
    return section;
  }

  function setDefaultContext(view) {
    context.replaceChildren();
    const label = document.createElement("strong");
    label.textContent = view.label;
    const text = document.createElement("span");
    text.textContent = view.description;
    context.append(label, text);
  }

  function renderView(key) {
    const view = config.views[key];
    if (!view) return;
    activeView = key;
    eyebrow.textContent = view.eyebrow;
    heading.textContent = view.title;
    description.textContent = view.description;
    stage.replaceChildren(...view.lanes.map(createLane));
    setDefaultContext(view);
    tabs.querySelectorAll("button").forEach((button) => {
      const selected = button.dataset.view === key;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function switchView(key) {
    if (switching || key === activeView || !config.views[key]) return;
    if (reducedMotion.matches || !stage.animate) {
      renderView(key);
      return;
    }

    switching = true;
    const exitAnimation = stage.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(8px)" },
      ],
      { duration: 130, easing: "ease-in", fill: "forwards" },
    );

    exitAnimation.finished
      .then(() => {
        renderView(key);
        return stage.animate(
          [
            { opacity: 0, transform: "translateY(-8px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
        ).finished;
      })
      .finally(() => {
        switching = false;
      });
  }

  Object.entries(config.views).forEach(([key, view]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.role = "tab";
    button.dataset.view = key;
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    iconPath.setAttribute("d", view.icon);
    icon.appendChild(iconPath);
    const label = document.createElement("span");
    label.textContent = view.label;
    button.append(icon, label);
    button.addEventListener("click", () => switchView(key));
    tabs.appendChild(button);
  });

  tabs.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const buttons = Array.from(tabs.querySelectorAll("button"));
    const currentIndex = buttons.findIndex((button) => button.dataset.view === activeView);
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = buttons.length - 1;
    buttons[nextIndex].focus();
    switchView(buttons[nextIndex].dataset.view);
  });

  renderView(activeView);
})();
