(() => {
  const archive = window.QIANLI_MEMBERS;
  const currentRoot = document.querySelector("[data-current-members]");
  const tabSlot = document.querySelector("[data-member-tabs]");
  const pastRoot = document.querySelector("[data-past-members]");
  if (!archive || !currentRoot || !tabSlot || !pastRoot) return;

  const imageRoot = ["assets", "images", "content", "members", "current", ""].join("/");
  const departmentOrder = ["management", "mechanical", "control", "hardware", "vision", "operations"];
  const departments = [...archive.current].sort(
    (left, right) => departmentOrder.indexOf(left.key) - departmentOrder.indexOf(right.key)
  );

  function currentCard([name, role, photo]) {
    const card = document.createElement("article");
    card.className = "current-member-card";
    const figure = document.createElement("figure");
    const setPlaceholder = () => {
      figure.classList.add("is-placeholder");
      figure.innerHTML = `<i class="mdi mdi-account-outline" aria-hidden="true"></i><span>照片待补</span>`;
    };

    if (photo) {
      const image = document.createElement("img");
      image.src = `${imageRoot}${photo}`;
      image.alt = name;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", setPlaceholder, { once: true });
      figure.appendChild(image);
    } else {
      setPlaceholder();
    }

    const caption = document.createElement("div");
    caption.innerHTML = `<h4>${name}</h4><p>${role}</p>`;
    card.append(figure, caption);
    return card;
  }

  const tabList = document.createElement("div");
  tabList.className = "member-department-tabs";
  tabList.setAttribute("role", "tablist");
  tabList.setAttribute("aria-label", "按组别查看现任团队成员");

  const stage = document.createElement("div");
  stage.className = "member-department-stage";
  const departmentButtons = new Map();
  const departmentPanels = new Map();

  departments.forEach((department, index) => {
    const button = document.createElement("button");
    const panelId = `member-department-${department.key}`;
    button.type = "button";
    button.className = "member-department-tab";
    button.dataset.department = department.key;
    button.id = `member-department-tab-${department.key}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", panelId);
    button.setAttribute("aria-selected", "false");
    button.tabIndex = -1;
    button.innerHTML = `<i class="mdi ${department.icon}" aria-hidden="true"></i><span>${department.label}</span>`;
    tabList.appendChild(button);
    departmentButtons.set(department.key, button);

    const panel = document.createElement("section");
    panel.className = "member-department-panel";
    panel.id = panelId;
    panel.dataset.departmentPanel = department.key;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", button.id);
    panel.hidden = true;
    panel.innerHTML = `<header class="member-department-intro"><h3>${department.label}</h3><p>${department.summary}</p></header>`;

    if (department.groups.length) {
      department.groups.forEach((group) => {
        const section = document.createElement("section");
        section.className = "current-member-group";
        section.innerHTML = `<header><h3>${group.label}</h3><p>${group.summary}</p></header><div class="current-member-grid"></div>`;
        section.querySelector(".current-member-grid").replaceChildren(...group.members.map(currentCard));
        panel.appendChild(section);
      });
    } else {
      const empty = document.createElement("div");
      empty.className = "member-department-empty";
      empty.innerHTML = `<i class="mdi mdi-image-outline" aria-hidden="true"></i><div><strong>成员档案整理中</strong><p>该组成员照片与职责资料将在完成核对后补充。</p></div>`;
      panel.appendChild(empty);
    }

    stage.appendChild(panel);
    departmentPanels.set(department.key, panel);

    button.addEventListener("click", () => activateDepartment(department.key, true));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let targetIndex = index;
      if (event.key === "ArrowLeft") targetIndex = (index - 1 + departments.length) % departments.length;
      if (event.key === "ArrowRight") targetIndex = (index + 1) % departments.length;
      if (event.key === "Home") targetIndex = 0;
      if (event.key === "End") targetIndex = departments.length - 1;
      activateDepartment(departments[targetIndex].key, true);
    });
  });

  function activateDepartment(key, focus = false) {
    departmentButtons.forEach((button, departmentKey) => {
      const active = departmentKey === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus({ preventScroll: true });
    });
    departmentPanels.forEach((panel, departmentKey) => {
      panel.hidden = departmentKey !== key;
    });
  }

  tabSlot.appendChild(tabList);
  currentRoot.appendChild(stage);
  activateDepartment(departments.find((department) => department.key === "management")?.key || departments[0]?.key);

  archive.seasons.forEach((season) => {
    const article = document.createElement("article");
    article.className = "past-member-season";
    article.innerHTML = `
      <header><div><span>RMUC ${season.season}</span><h3>${season.season} 赛季</h3></div><p>${season.event}</p></header>
      <div class="past-member-groups"></div>`;
    const groups = article.querySelector(".past-member-groups");
    if (!season.groups.length) {
      const pending = document.createElement("p");
      pending.className = "past-member-pending";
      pending.textContent = "待更新";
      groups.appendChild(pending);
    }
    season.groups.forEach(([label, names]) => {
      const group = document.createElement("section");
      group.className = "past-member-group";
      const kindMap = {
        "正式队员": "member",
        "梯队队员": "trainee",
        "顾问": "advisor",
        "指导老师": "teacher"
      };
      group.dataset.memberKind = kindMap[label] || "other";
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
  let lockedKey = "";
  let lockUntil = 0;

  const activateRail = (key) => {
    rail.querySelectorAll("button").forEach((button) => {
      const active = button.dataset.memberTarget === key;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  };

  sections.forEach((section, index) => {
    const key = section.dataset.memberSection;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.memberTarget = key;
    button.setAttribute("aria-label", `前往${labels[key]}`);
    button.innerHTML = `<span aria-hidden="true"></span><b>${String(index + 1).padStart(2, "0")}</b><em>${labels[key]}</em>`;
    button.addEventListener("click", () => {
      lockedKey = key;
      lockUntil = performance.now() + 900;
      activateRail(key);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top = section.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      window.setTimeout(() => {
        lockedKey = "";
        syncRail();
      }, 940);
    });
    rail.appendChild(button);
  });
  document.body.appendChild(rail);

  let railFrame = 0;
  function syncRail() {
    if (lockedKey && performance.now() < lockUntil) {
      activateRail(lockedKey);
      return;
    }
    const probe = window.scrollY + Math.min(window.innerHeight * 0.34, 320);
    let activeSection = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= probe) activeSection = section;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      activeSection = sections.at(-1);
    }
    activateRail(activeSection?.dataset.memberSection);
  }

  const requestRailSync = () => {
    if (railFrame) return;
    railFrame = window.requestAnimationFrame(() => {
      railFrame = 0;
      syncRail();
    });
  };

  window.addEventListener("scroll", requestRailSync, { passive: true });
  window.addEventListener("resize", requestRailSync);
  syncRail();
})();
