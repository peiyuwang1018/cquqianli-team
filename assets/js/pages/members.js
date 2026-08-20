(() => {
  const archive = window.QIANLI_MEMBERS;
  const currentRoot = document.querySelector("[data-current-members]");
  const pastRoot = document.querySelector("[data-past-members]");
  if (!archive || !currentRoot || !pastRoot) return;

  const imageRoot = ["assets", "images", "content", "members", "current", ""].join("/");

  function currentCard([name, role, photo]) {
    const card = document.createElement("article");
    card.className = "current-member-card";
    card.innerHTML = `
      <figure><img src="${imageRoot}${photo}" alt="${name}" loading="lazy" decoding="async" /></figure>
      <div><h3>${name}</h3><p>${role}</p></div>`;
    return card;
  }

  archive.current.forEach((group) => {
    const section = document.createElement("section");
    section.className = "current-member-group";
    section.innerHTML = `<header><h3>${group.label}</h3><p>${group.summary}</p></header><div class="current-member-grid"></div>`;
    section.querySelector(".current-member-grid").replaceChildren(...group.members.map(currentCard));
    currentRoot.appendChild(section);
  });

  archive.seasons.forEach((season) => {
    const article = document.createElement("article");
    article.className = "past-member-season";
    article.innerHTML = `
      <header><div><span>RMUC ${season.season}</span><h3>${season.season} 赛季</h3></div><p>${season.event}</p></header>
      <div class="past-member-groups"></div>`;
    const groups = article.querySelector(".past-member-groups");
    season.groups.forEach(([label, names]) => {
      const group = document.createElement("section");
      group.className = "past-member-group";
      group.innerHTML = `<h4>${label}<small>${names.length}</small></h4><div></div>`;
      const list = group.querySelector("div");
      names.forEach((name) => {
        const tag = document.createElement("span");
        tag.textContent = name;
        list.appendChild(tag);
      });
      groups.appendChild(group);
    });
    pastRoot.appendChild(article);
  });

  const sections = [...document.querySelectorAll("[data-member-section]")];
  const rail = document.createElement("nav");
  rail.className = "member-section-rail";
  rail.setAttribute("aria-label", "成员档案导航");
  const labels = { current: "现任成员", past: "历届成员" };

  sections.forEach((section, index) => {
    const key = section.dataset.memberSection;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.memberTarget = key;
    button.setAttribute("aria-label", `前往${labels[key]}`);
    button.innerHTML = `<span aria-hidden="true"></span><b>${String(index + 1).padStart(2, "0")}</b><em>${labels[key]}</em>`;
    button.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth", block: "start" }));
    rail.appendChild(button);
  });
  document.body.appendChild(rail);

  const activate = (key) => {
    rail.querySelectorAll("button").forEach((button) => {
      const active = button.dataset.memberTarget === key;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  };
  activate(sections[0]?.dataset.memberSection);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) activate(current.target.dataset.memberSection);
      },
      { rootMargin: "-22% 0px -55%", threshold: [0, 0.12, 0.3] }
    );
    sections.forEach((section) => observer.observe(section));
  }
})();
