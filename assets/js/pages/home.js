const homeCarousel = document.querySelector("[data-home-carousel]");
const recruitmentNotice = document.querySelector("[data-recruitment-notice]");

if (recruitmentNotice) {
  const closeButton = recruitmentNotice.querySelector("[data-recruitment-notice-close]");
  closeButton?.addEventListener("click", () => {
    recruitmentNotice.hidden = true;
  });
}

const goldenRainButton = document.querySelector("[data-golden-rain-toggle]");

if (goldenRainButton) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const colors = ["#b88932", "#cfa451", "#e4bd70", "#f1d58d"];
  let particles = [];
  let frameId = 0;
  let autoStopTimer = 0;
  let lastFrameTime = 0;
  let isActive = false;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  canvas.className = "golden-rain-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);

  const makeParticle = (fillViewport = true) => ({
    x: Math.random() * viewportWidth,
    y: fillViewport ? Math.random() * viewportHeight : -18 - Math.random() * 80,
    width: (1 + Math.random() * 2.2) * 1.2,
    length: (5 + Math.random() * 9) * 1.2,
    speed: 70 + Math.random() * 120,
    drift: -12 + Math.random() * 24,
    angle: -0.28 + Math.random() * 0.56,
    spin: -0.7 + Math.random() * 1.4,
    alpha: 0.46 + Math.random() * 0.48,
    color: colors[Math.floor(Math.random() * colors.length)],
  });

  const resizeCanvas = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    canvas.width = Math.round(viewportWidth * pixelRatio);
    canvas.height = Math.round(viewportHeight * pixelRatio);
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const particleCount = viewportWidth < 760 ? 240 : 400;
    particles = Array.from({ length: particleCount }, () => makeParticle(true));
  };

  const drawParticle = (particle) => {
    context.save();
    context.globalAlpha = particle.alpha;
    context.fillStyle = particle.color;
    context.translate(particle.x, particle.y);
    context.rotate(particle.angle);
    context.fillRect(-particle.width / 2, -particle.length / 2, particle.width, particle.length);
    context.restore();
  };

  const drawFrame = (time) => {
    if (!isActive) return;
    const delta = Math.min((time - lastFrameTime) / 1000 || 0, 0.05);
    lastFrameTime = time;
    context.clearRect(0, 0, viewportWidth, viewportHeight);

    particles.forEach((particle) => {
      particle.y += particle.speed * delta;
      particle.x += particle.drift * delta;
      particle.angle += particle.spin * delta;

      if (particle.y > viewportHeight + particle.length || particle.x < -20 || particle.x > viewportWidth + 20) {
        Object.assign(particle, makeParticle(false));
      }
      drawParticle(particle);
    });

    frameId = window.requestAnimationFrame(drawFrame);
  };

  const startRain = () => {
    if (!context || isActive) return;
    isActive = true;
    resizeCanvas();
    goldenRainButton.classList.add("is-active");
    goldenRainButton.setAttribute("aria-pressed", "true");
    goldenRainButton.setAttribute("aria-label", "关闭金色雨");
    canvas.classList.add("is-active");
    lastFrameTime = performance.now();
    window.clearTimeout(autoStopTimer);
    autoStopTimer = window.setTimeout(stopRain, 5000);

    if (reducedMotion.matches) {
      context.clearRect(0, 0, viewportWidth, viewportHeight);
      particles.slice(0, 70).forEach(drawParticle);
      return;
    }
    frameId = window.requestAnimationFrame(drawFrame);
  };

  const stopRain = () => {
    isActive = false;
    window.cancelAnimationFrame(frameId);
    window.clearTimeout(autoStopTimer);
    goldenRainButton.classList.remove("is-active");
    goldenRainButton.setAttribute("aria-pressed", "false");
    goldenRainButton.setAttribute("aria-label", "开启金色雨");
    canvas.classList.remove("is-active");
    window.setTimeout(() => {
      if (!isActive) context.clearRect(0, 0, viewportWidth, viewportHeight);
    }, 280);
  };

  goldenRainButton.addEventListener("click", () => {
    if (isActive) stopRain();
    else startRain();
  });

  window.addEventListener("resize", () => {
    if (isActive) resizeCanvas();
  });

  document.addEventListener("visibilitychange", () => {
    if (!isActive || reducedMotion.matches) return;
    window.cancelAnimationFrame(frameId);
    if (!document.hidden) {
      lastFrameTime = performance.now();
      frameId = window.requestAnimationFrame(drawFrame);
    }
  });
}

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
