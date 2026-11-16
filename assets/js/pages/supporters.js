(() => {
  const store = window.QIANLI_SUPPORTERS;
  if (!store || !Array.isArray(store.items)) return;

  // 只有姓名已确认且未标记 pending 的记录才会展示。
  const items = store.items.filter((item) => item && !item.pending && item.name);
  if (!items.length) return;

  const badge = (text) => {
    const span = document.createElement("span");
    span.className = "supporter-badge";
    span.innerHTML = `<i class="mdi mdi-flower-tulip-outline" aria-hidden="true"></i>${text}`;
    return span;
  };

  document.querySelectorAll("[data-supporter-list]").forEach((root) => {
    const isLegacy = root.classList.contains("legacy-supporters");
    const cards = items.map((item) => {
      if (isLegacy) {
        const row = document.createElement("article");
        const name = document.createElement("h4");
        name.textContent = item.name;
        const detail = document.createElement("p");
        detail.textContent = [item.cohort, item.kind, item.amount].filter(Boolean).join(" · ");
        row.append(name, detail);
        if (item.badge) row.appendChild(badge(item.badge));
        return row;
      }
      const card = document.createElement("article");
      card.className = "supporter-card";
      const name = document.createElement("h3");
      name.textContent = item.name;
      const detail = document.createElement("p");
      detail.textContent = [item.cohort, item.kind, item.amount].filter(Boolean).join(" · ");
      card.append(name, detail);
      if (item.badge) card.appendChild(badge(item.badge));
      return card;
    });
    root.replaceChildren(...cards);
    root.hidden = false;
    if (!isLegacy) {
      const section = root.closest(".supporter-section");
      if (section) section.hidden = false;
    }
  });

  document.querySelectorAll("[data-supporter-count]").forEach((el) => {
    el.textContent = `${items.length} 位`;
  });
})();
