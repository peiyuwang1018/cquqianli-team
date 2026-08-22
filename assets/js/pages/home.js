const homeCarousel = document.querySelector("[data-home-carousel]");

if (homeCarousel) {
  const slides = [...homeCarousel.querySelectorAll("[data-home-slide]")];
  const dots = [...homeCarousel.querySelectorAll("[data-home-carousel-dot]")];
  const action = homeCarousel.querySelector("[data-home-carousel-action]");
  const actionLabel = homeCarousel.querySelector("[data-home-carousel-action-label]");
  const carouselItems = [
    { label: "加入我们", href: "join/index.html" },
    { label: "查看战队成员", href: "season/members.html" },
    { label: "前往档案馆", href: "museum/projects.html" },
    { label: "查看团队资源", href: "about/resources.html" },
  ];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let rotationTimer = null;
  let isPointerInside = false;
  let isFocusInside = false;

  const showSlide = (nextIndex) => {
    if (!slides[nextIndex] || !carouselItems[nextIndex]) return;

    activeIndex = nextIndex;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
      dot.tabIndex = isActive ? 0 : -1;
    });

    if (action) {
      action.href = carouselItems[activeIndex].href;
    }
    if (actionLabel) actionLabel.textContent = carouselItems[activeIndex].label;
  };

  const stopRotation = () => {
    window.clearInterval(rotationTimer);
    rotationTimer = null;
  };
  const startRotation = () => {
    stopRotation();
    if (prefersReducedMotion.matches || slides.length < 2 || isPointerInside || isFocusInside) return;
    rotationTimer = window.setInterval(() => showSlide((activeIndex + 1) % slides.length), 3000);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startRotation();
    });
    dot.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + dots.length) % dots.length;
      showSlide(nextIndex);
      dots[nextIndex].focus();
      startRotation();
    });
  });

  homeCarousel.addEventListener("mouseenter", () => {
    isPointerInside = true;
    stopRotation();
  });
  homeCarousel.addEventListener("mouseleave", () => {
    isPointerInside = false;
    startRotation();
  });
  homeCarousel.addEventListener("focusin", () => {
    isFocusInside = true;
    stopRotation();
  });
  homeCarousel.addEventListener("focusout", (event) => {
    if (homeCarousel.contains(event.relatedTarget)) return;
    isFocusInside = false;
    startRotation();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopRotation();
    else startRotation();
  });

  showSlide(0);
  startRotation();
}

const homeSectionNav = document.querySelector("[data-home-section-nav]");
const homeSections = [...document.querySelectorAll("[data-home-snap-section]")];

if (homeSectionNav && homeSections.length) {
  const sectionButtons = [...homeSectionNav.querySelectorAll("[data-home-section-target]")];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setActiveSection = (sectionId) => {
    sectionButtons.forEach((button) => {
      const isActive = button.dataset.homeSectionTarget === sectionId;
      button.classList.toggle("is-active", isActive);
      if (isActive) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  };

  sectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const section = document.getElementById(button.dataset.homeSectionTarget);
      if (!section) return;
      section.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "start" });
    });
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
      if (visibleSection) setActiveSection(visibleSection.target.id);
    },
    { rootMargin: "-18% 0px -46% 0px", threshold: [0, 0.2, 0.45, 0.7] },
  );

  homeSections.forEach((section) => sectionObserver.observe(section));
  setActiveSection(homeSections[0].id);
}
