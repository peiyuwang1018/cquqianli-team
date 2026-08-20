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
      <button class="history-node-card" type="button" aria-haspopup="dialog" aria-label="打开 ${entry.years} ${entry.title} 档案">
        <span class="history-node-era">${entry.era}</span>
        <span class="history-node-years">${entry.years}</span>
        <strong>${entry.title}</strong>
        <p>${entry.summary}</p>
        <span class="history-node-open"><i class="mdi mdi-arrow-top-right" aria-hidden="true"></i><span>阅读档案</span></span>
      </button>
      <span class="history-node-marker" aria-hidden="true"><b>${String(index + 1).padStart(2, "0")}</b></span>`;
    item.querySelector("button").addEventListener("click", () => openEntry(entry));
    return item;
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

  list.replaceChildren(...archive.entries.map(makeNode));
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
