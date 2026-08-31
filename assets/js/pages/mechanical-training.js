(() => {
  const links = Array.from(document.querySelectorAll("[data-mechanical-course]"));
  const panels = Array.from(document.querySelectorAll("[data-mechanical-course-panel]"));

  if (!links.length || !panels.length) return;

  const availableCourses = new Set(panels.map((panel) => panel.dataset.mechanicalCoursePanel));

  const activateCourse = (course, options = {}) => {
    if (!availableCourses.has(course)) return;

    links.forEach((link) => {
      const active = link.dataset.mechanicalCourse === course;
      link.classList.toggle("is-active", active);
      link.setAttribute("aria-pressed", String(active));
    });

    panels.forEach((panel) => {
      const active = panel.dataset.mechanicalCoursePanel === course;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });

    if (options.updateHistory !== false) {
      history.replaceState(null, "", `#course-${course}`);
    }

    if (options.scroll && window.matchMedia("(max-width: 820px)").matches) {
      document.querySelector(".mechanical-course-reader")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  links.forEach((link, index) => {
    link.addEventListener("click", () => activateCourse(link.dataset.mechanicalCourse, { scroll: true }));
    link.addEventListener("keydown", (event) => {
      const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowDown") nextIndex = Math.min(links.length - 1, index + 1);
      if (event.key === "ArrowUp") nextIndex = Math.max(0, index - 1);
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = links.length - 1;
      links[nextIndex].focus();
    });
  });

  const initialCourse = location.hash.startsWith("#course-")
    ? location.hash.replace("#course-", "")
    : "intro";
  activateCourse(availableCourses.has(initialCourse) ? initialCourse : "intro", { updateHistory: false });

  window.addEventListener("hashchange", () => {
    const course = location.hash.replace("#course-", "");
    if (availableCourses.has(course)) activateCourse(course, { updateHistory: false });
  });
})();
