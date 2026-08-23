(() => {
  const honors = window.QIANLI_HONORS;
  const root = document.querySelector("[data-honor-archive]");
  if (!root || !Array.isArray(honors) || !honors.length) return;

  const filters = root.querySelector("[data-honor-filters]");
  const groups = root.querySelector("[data-honor-groups]");
  const total = root.querySelector("[data-honor-total]");
  const years = [...new Set(honors.map((item) => item.year))].sort((a, b) => b - a);
  let visibleHonors = [...honors];
  let lightboxIndex = 0;

  if (total) total.textContent = String(honors.length);

  const lightbox = document.createElement("dialog");
  lightbox.className = "honor-lightbox";
  lightbox.innerHTML = `
    <div class="honor-lightbox__inner">
      <button class="honor-lightbox__close" type="button" aria-label="关闭证书预览"><i class="mdi mdi-close" aria-hidden="true"></i></button>
      <button class="honor-lightbox__arrow honor-lightbox__arrow--prev" type="button" aria-label="上一张证书"><i class="mdi mdi-chevron-left" aria-hidden="true"></i></button>
      <figure>
        <img alt="" data-honor-lightbox-image />
        <figcaption>
          <span><small data-honor-lightbox-series></small><strong data-honor-lightbox-title></strong></span>
          <b data-honor-lightbox-counter></b>
        </figcaption>
      </figure>
      <button class="honor-lightbox__arrow honor-lightbox__arrow--next" type="button" aria-label="下一张证书"><i class="mdi mdi-chevron-right" aria-hidden="true"></i></button>
    </div>`;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector("[data-honor-lightbox-image]");
  const lightboxSeries = lightbox.querySelector("[data-honor-lightbox-series]");
  const lightboxTitle = lightbox.querySelector("[data-honor-lightbox-title]");
  const lightboxCounter = lightbox.querySelector("[data-honor-lightbox-counter]");
  const previousButton = lightbox.querySelector(".honor-lightbox__arrow--prev");
  const nextButton = lightbox.querySelector(".honor-lightbox__arrow--next");

  function updateLightbox() {
    const item = visibleHonors[lightboxIndex];
    if (!item) return;
    lightboxImage.src = item.image;
    lightboxImage.alt = `${item.year} ${item.event} ${item.award}获奖证书`;
    lightboxSeries.textContent = `${item.year} · ${item.series} · ${item.team}`;
    lightboxTitle.textContent = `${item.event} · ${item.award}`;
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${visibleHonors.length}`;
    const hasMultiple = visibleHonors.length > 1;
    previousButton.hidden = !hasMultiple;
    nextButton.hidden = !hasMultiple;
  }

  function openLightbox(item) {
    lightboxIndex = visibleHonors.indexOf(item);
    updateLightbox();
    document.body.classList.add("has-honor-lightbox");
    lightbox.showModal();
  }

  function moveLightbox(direction) {
    lightboxIndex = (lightboxIndex + direction + visibleHonors.length) % visibleHonors.length;
    updateLightbox();
  }

  function createCard(item, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "honor-card";
    card.setAttribute("aria-label", `查看${item.year}年${item.event}${item.award}证书`);

    const figure = document.createElement("span");
    figure.className = "honor-card__figure";
    const image = document.createElement("img");
    image.src = item.image;
    image.alt = "";
    image.loading = index < 4 ? "eager" : "lazy";
    image.decoding = "async";
    const view = document.createElement("span");
    view.className = "honor-card__view";
    view.innerHTML = '<i class="mdi mdi-magnify-plus-outline" aria-hidden="true"></i><span>查看原件</span>';
    figure.append(image, view);

    const body = document.createElement("span");
    body.className = "honor-card__body";
    const meta = document.createElement("span");
    meta.className = "honor-card__meta";
    meta.innerHTML = `<b>${item.series}</b><small>${item.team}</small>`;
    const title = document.createElement("strong");
    title.textContent = item.event;
    const award = document.createElement("span");
    award.className = "honor-card__award";
    award.textContent = item.award;
    body.append(meta, title, award);

    card.append(figure, body);
    card.addEventListener("click", () => openLightbox(item));
    return card;
  }

  function render(year = "all") {
    visibleHonors = year === "all" ? [...honors] : honors.filter((item) => item.year === Number(year));
    const fragment = document.createDocumentFragment();
    const visibleYears = year === "all" ? years : [Number(year)];

    visibleYears.forEach((visibleYear) => {
      const items = visibleHonors.filter((item) => item.year === visibleYear);
      if (!items.length) return;

      const section = document.createElement("section");
      section.className = "honor-year-group";
      const heading = document.createElement("header");
      heading.innerHTML = `<div><span>${visibleYear}</span><small>SEASON</small></div><p>${items.length} 项集体荣誉</p>`;
      const grid = document.createElement("div");
      grid.className = "honor-grid";
      items.forEach((item, index) => grid.appendChild(createCard(item, index)));
      section.append(heading, grid);
      fragment.appendChild(section);
    });

    groups.replaceChildren(fragment);
  }

  function createFilter(value, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.year = value;
    button.textContent = label;
    button.setAttribute("aria-pressed", value === "all" ? "true" : "false");
    button.addEventListener("click", () => {
      filters.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      render(value);
    });
    return button;
  }

  filters.appendChild(createFilter("all", "全部"));
  years.forEach((year) => filters.appendChild(createFilter(String(year), String(year))));
  render();

  lightbox.querySelector(".honor-lightbox__close").addEventListener("click", () => lightbox.close());
  previousButton.addEventListener("click", () => moveLightbox(-1));
  nextButton.addEventListener("click", () => moveLightbox(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("close", () => document.body.classList.remove("has-honor-lightbox"));
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && visibleHonors.length > 1) moveLightbox(-1);
    if (event.key === "ArrowRight" && visibleHonors.length > 1) moveLightbox(1);
  });
})();
