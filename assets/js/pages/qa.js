(() => {
  const select = document.querySelector("#qa-filter");
  const chips = [...document.querySelectorAll("[data-qa-filter]")];
  const items = [...document.querySelectorAll("[data-qa-category]")];
  const empty = document.querySelector("[data-qa-empty]");
  if (!select || !items.length) return;

  const applyFilter = (value) => {
    let visibleCount = 0;
    items.forEach((item) => {
      const visible = value === "all" || item.dataset.qaCategory === value;
      item.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    chips.forEach((chip) => {
      const active = chip.dataset.qaFilter === value;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });

    select.value = value;
    if (empty) empty.hidden = visibleCount > 0;
  };

  select.addEventListener("change", () => applyFilter(select.value));
  chips.forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.classList.contains("is-active")));
    chip.addEventListener("click", () => applyFilter(chip.dataset.qaFilter));
  });

  applyFilter(select.value);
})();
