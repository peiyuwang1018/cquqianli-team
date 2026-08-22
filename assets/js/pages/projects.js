(() => {
  const filters = Array.from(document.querySelectorAll("[data-project-filter]"));
  const cards = Array.from(document.querySelectorAll(".project-card[data-project-groups]"));
  const accordions = Array.from(document.querySelectorAll(".project-accordion"));
  const carouselUpdaters = [];

  if (!filters.length || !cards.length) return;

  const groupLabels = {
    all: "全部",
    general: "通用",
    mechanical: "机械组",
    control: "电控组",
    vision: "视觉组",
    hardware: "硬件组",
    operations: "宣运组",
  };

  const applyFilter = (filter) => {
    cards.forEach((card) => {
      const groups = card.dataset.projectGroups.split(/\s+/);
      card.hidden = filter !== "all" && !groups.includes(filter);
    });

    accordions.forEach((accordion) => {
      const shell = accordion.querySelector(".project-carousel-shell");
      const carousel = accordion.querySelector(".project-carousel");
      const visibleCards = Array.from(accordion.querySelectorAll(".project-card")).filter((card) => !card.hidden);
      let emptyState = accordion.querySelector(".project-category-empty");

      if (!emptyState) {
        emptyState = document.createElement("div");
        emptyState.className = "project-category-empty";
        emptyState.innerHTML = '<i class="mdi mdi-folder-search-outline" aria-hidden="true"></i><p></p>';
        shell?.appendChild(emptyState);
      }

      const isEmpty = visibleCards.length === 0;
      shell?.classList.toggle("is-empty", isEmpty);
      emptyState.hidden = !isEmpty;
      emptyState.querySelector("p").textContent = `${groupLabels[filter] || "该组"}在这一分类下的项目资料整理中。`;
      if (carousel) carousel.scrollLeft = 0;
    });

    filters.forEach((button) => {
      const isActive = button.dataset.projectFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    requestAnimationFrame(() => carouselUpdaters.forEach((update) => update()));
  };

  filters.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.projectFilter));
  });

  accordions.forEach((accordion) => {
    accordion.addEventListener("toggle", () => {
      if (!accordion.open) return;
      accordions.forEach((otherAccordion) => {
        if (otherAccordion !== accordion) otherAccordion.open = false;
      });
    });
  });

  document.querySelectorAll(".project-carousel-shell").forEach((shell) => {
    const carousel = shell.querySelector(".project-carousel");
    const previous = shell.querySelector(".project-carousel-prev");
    const next = shell.querySelector(".project-carousel-next");
    const accordion = shell.closest(".project-accordion");

    if (!carousel || !previous || !next) return;

    const updateButtons = () => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      previous.disabled = shell.classList.contains("is-empty") || carousel.scrollLeft <= 2;
      next.disabled = shell.classList.contains("is-empty") || carousel.scrollLeft >= maxScroll - 2;
      shell.classList.add("is-ready");
    };

    const scroll = (direction) => {
      const step = Math.max(220, Math.floor(carousel.clientWidth * 0.82));
      carousel.scrollBy({ left: step * direction, behavior: "smooth" });
    };

    previous.addEventListener("click", () => scroll(-1));
    next.addEventListener("click", () => scroll(1));
    carousel.addEventListener("scroll", updateButtons, { passive: true });
    accordion?.addEventListener("toggle", () => {
      if (!accordion.open) return;
      shell.classList.remove("is-ready");
      requestAnimationFrame(updateButtons);
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(updateButtons).observe(carousel);
    } else {
      window.addEventListener("resize", updateButtons);
    }

    carouselUpdaters.push(updateButtons);
    requestAnimationFrame(updateButtons);
  });

  applyFilter("all");
})();
