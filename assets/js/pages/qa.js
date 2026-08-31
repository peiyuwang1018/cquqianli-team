(() => {
  const questions = Array.isArray(window.QIANLI_QA) ? window.QIANLI_QA : [];
  const list = document.querySelector("[data-qa-list]");
  const audienceSelect = document.querySelector("#qa-audience-filter");
  const groupSelect = document.querySelector("#qa-group-filter");
  const count = document.querySelector("[data-qa-count]");
  const empty = document.querySelector("[data-qa-empty]");

  if (!list || !audienceSelect || !groupSelect || !questions.length) return;

  const createQuestion = (item) => {
    const details = document.createElement("details");
    details.className = "qa-item";
    details.dataset.qaAudience = item.audiences.join(" ");
    details.dataset.qaGroups = item.groups.join(" ");

    const summary = document.createElement("summary");
    const category = document.createElement("span");
    category.textContent = item.category;

    const question = document.createElement("strong");
    question.dataset.qaEmoji = item.emoji;
    question.textContent = item.question;

    const chevron = document.createElement("i");
    chevron.className = "mdi mdi-chevron-down";
    chevron.setAttribute("aria-hidden", "true");
    summary.append(category, question, chevron);

    const answer = document.createElement("div");
    answer.className = "qa-answer";
    item.answer.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      answer.append(paragraph);
    });

    details.append(summary, answer);
    return details;
  };

  const items = questions.map(createQuestion);
  list.replaceChildren(...items);

  const applyFilters = () => {
    const audience = audienceSelect.value;
    const group = groupSelect.value;
    let visibleCount = 0;

    items.forEach((item) => {
      const audiences = item.dataset.qaAudience.split(" ");
      const groups = item.dataset.qaGroups.split(" ");
      const audienceMatches = audience === "all" || audiences.includes(audience);
      const groupMatches = group === "all" || groups.includes(group);
      const visible = audienceMatches && groupMatches;

      item.hidden = !visible;
      if (!visible) item.open = false;
      if (visible) visibleCount += 1;
    });

    if (count) count.textContent = `显示 ${visibleCount} 条`;
    if (empty) {
      empty.hidden = visibleCount > 0;
      empty.textContent = "暂时没有同时符合这两个条件的问题。可以放宽一个筛选条件再看看。";
    }
  };

  audienceSelect.addEventListener("change", applyFilters);
  groupSelect.addEventListener("change", applyFilters);
  applyFilters();
})();
