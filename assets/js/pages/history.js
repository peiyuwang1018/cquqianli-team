(() => {
  const archive = window.QIANLI_HISTORY;
  const list = document.querySelector("[data-history-list]");
  if (!archive?.entries?.length || !list) return;

  const dialog = document.createElement("dialog");
  dialog.className = "history-dialog";
  dialog.setAttribute("aria-labelledby", "history-dialog-title");
  dialog.innerHTML = `
    <div class="history-dialog-shell">
      <button class="history-dialog-close" type="button" aria-label="关闭队史档案"><i class="mdi mdi-close" aria-hidden="true"></i></button>
      <section class="history-dialog-media" aria-label="历史图片">
        <div class="history-carousel" data-history-carousel></div>
        <button class="history-carousel-arrow history-carousel-arrow--previous" type="button" aria-label="上一张图片"><i class="mdi mdi-chevron-left" aria-hidden="true"></i></button>
        <button class="history-carousel-arrow history-carousel-arrow--next" type="button" aria-label="下一张图片"><i class="mdi mdi-chevron-right" aria-hidden="true"></i></button>
        <div class="history-carousel-footer"><span data-history-caption></span><div class="history-carousel-dots" data-history-dots></div></div>
      </section>
      <article class="history-letter">
        <header class="history-letter-header">
          <span data-history-era></span>
          <p data-history-years></p>
          <h2 id="history-dialog-title" data-history-title></h2>
        </header>
        <dl class="history-letter-facts" data-history-facts></dl>
        <div class="history-letter-copy" data-history-copy></div>
      </article>
    </div>`;
  document.body.appendChild(dialog);

  const carousel = dialog.querySelector("[data-history-carousel]");
  const caption = dialog.querySelector("[data-history-caption]");
  const dots = dialog.querySelector("[data-history-dots]");
  const previous = dialog.querySelector(".history-carousel-arrow--previous");
  const next = dialog.querySelector(".history-carousel-arrow--next");
  let activeEntry = null;
  let activeSlide = 0;

  function makeNode(entry, index) {
    const item = document.createElement("article");
    item.className = "history-node";
    item.id = entry.id;
    item.innerHTML = `
      <figure class="history-node-cover"></figure>
      <button class="history-node-card" type="button" aria-haspopup="dialog" aria-label="打开 ${entry.years} ${entry.title} 档案">
        <span class="history-node-era">${entry.era}</span>
        <span class="history-node-years">${entry.years}</span>
        <strong>${entry.title}</strong>
        <p>${entry.summary}</p>
        <span class="history-node-open"><i class="mdi mdi-arrow-top-right" aria-hidden="true"></i><span>阅读档案</span></span>
      </button>
      <span class="history-node-marker" aria-hidden="true"><b>${String(index + 1).padStart(2, "0")}</b></span>`;

    const cover = item.querySelector(".history-node-cover");
    if (entry.cover?.src) {
      const image = document.createElement("img");
      image.src = entry.cover.src;
      image.alt = entry.cover.alt || entry.title;
      image.loading = index < 3 ? "eager" : "lazy";
      image.decoding = "async";
      const caption = document.createElement("figcaption");
      caption.textContent = entry.cover.caption || entry.title;
      cover.append(image, caption);
    } else {
      cover.classList.add("is-placeholder");
      cover.innerHTML = `<i class="mdi mdi-image-outline" aria-hidden="true"></i><span>${entry.cover?.label || "代表照片待归档"}</span>`;
    }
    item.querySelector("button").addEventListener("click", () => openEntry(entry));
    return item;
  }

  function makePhase(phase, startIndex) {
    const section = document.createElement("section");
    section.className = "history-phase";
    section.id = `history-phase-${phase.id}`;
    section.dataset.historyPhase = phase.id;
    section.innerHTML = `
      <header class="history-phase-header">
        <div><span>${phase.label}</span><p>${phase.years}</p><h2>${phase.title}</h2></div>
        <p>${phase.summary}</p>
      </header>
      <div class="history-phase-nodes"></div>`;
    const phaseEntries = archive.entries.filter((entry) => entry.phase === phase.id);
    section.querySelector(".history-phase-nodes").replaceChildren(
      ...phaseEntries.map((entry, index) => makeNode(entry, startIndex + index))
    );
    return { section, count: phaseEntries.length };
  }

  function buildPhaseRail() {
    if (!archive.phases?.length) return;
    const rail = document.createElement("nav");
    rail.className = "history-phase-rail";
    rail.setAttribute("aria-label", "队史阶段导航");
    archive.phases.forEach((phase, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.phaseTarget = phase.id;
      button.setAttribute("aria-label", `前往${phase.title}`);
      button.innerHTML = `<span aria-hidden="true"></span><b>${String(index + 1).padStart(2, "0")}</b><em>${phase.title}</em>`;
      button.addEventListener("click", () => {
        document.querySelector(`#history-phase-${phase.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      rail.appendChild(button);
    });
    document.body.appendChild(rail);

    const activate = (phaseId) => {
      rail.querySelectorAll("button").forEach((button) => {
        const active = button.dataset.phaseTarget === phaseId;
        button.classList.toggle("is-active", active);
        if (active) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
    };
    activate(archive.phases[0].id);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const current = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (current) activate(current.target.dataset.historyPhase);
        },
        { rootMargin: "-18% 0px -58%", threshold: [0, 0.12, 0.35] }
      );
      document.querySelectorAll("[data-history-phase]").forEach((section) => observer.observe(section));
    }
  }

  function renderSlide() {
    const media = activeEntry.gallery[activeSlide];
    carousel.replaceChildren();
    if (media.placeholder) {
      const placeholder = document.createElement("div");
      placeholder.className = "history-carousel-placeholder";
      placeholder.innerHTML = '<i class="mdi mdi-image-outline" aria-hidden="true"></i><span>照片待归档</span>';
      carousel.appendChild(placeholder);
      caption.textContent = media.label;
    } else {
      const image = document.createElement("img");
      image.src = media.src;
      image.alt = media.alt;
      carousel.appendChild(image);
      caption.textContent = media.caption;
    }

    dots.querySelectorAll("button").forEach((button, index) => {
      const selected = index === activeSlide;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-current", String(selected));
    });
    const multiple = activeEntry.gallery.length > 1;
    previous.hidden = !multiple;
    next.hidden = !multiple;
  }

  function moveSlide(direction) {
    activeSlide = (activeSlide + direction + activeEntry.gallery.length) % activeEntry.gallery.length;
    renderSlide();
  }

  function openEntry(entry) {
    activeEntry = entry;
    activeSlide = 0;
    dialog.querySelector("[data-history-era]").textContent = entry.era;
    dialog.querySelector("[data-history-years]").textContent = entry.years;
    dialog.querySelector("[data-history-title]").textContent = entry.title;

    const facts = dialog.querySelector("[data-history-facts]");
    facts.replaceChildren(...entry.facts.map(([term, description]) => {
      const group = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = description;
      group.append(dt, dd);
      return group;
    }));

    const copy = dialog.querySelector("[data-history-copy]");
    copy.replaceChildren(...entry.paragraphs.map((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      return p;
    }));

    dots.replaceChildren(...entry.gallery.map((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `查看第 ${index + 1} 张图片`);
      button.addEventListener("click", () => {
        activeSlide = index;
        renderSlide();
      });
      return button;
    }));

    renderSlide();
    document.body.classList.add("has-history-dialog");
    dialog.showModal();
  }

  let nodeIndex = 0;
  const phaseSections = (archive.phases || []).map((phase) => {
    const result = makePhase(phase, nodeIndex);
    nodeIndex += result.count;
    return result.section;
  });
  list.replaceChildren(...phaseSections);
  buildPhaseRail();
  dialog.querySelector(".history-dialog-close").addEventListener("click", () => dialog.close());
  previous.addEventListener("click", () => moveSlide(-1));
  next.addEventListener("click", () => moveSlide(1));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveSlide(-1);
    if (event.key === "ArrowRight") moveSlide(1);
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("has-history-dialog");
    activeEntry = null;
  });
})();
