(() => {
  const archive = window.QIANLI_MATCH_ARCHIVE;
  const root = document.querySelector("[data-match-archive]");
  if (!archive?.seasons?.length || !root) return;

  const tabs = root.querySelector("[data-match-season-tabs]");
  const summary = root.querySelector("[data-match-season-summary]");
  const list = root.querySelector("[data-match-list]");
  const resultLabels = { win: "胜", loss: "负", draw: "平" };

  function isQianli(team) {
    return team.includes("重庆大学");
  }

  function renderSummary(season) {
    const title = document.createElement("div");
    title.className = "match-summary-title";
    const label = document.createElement("span");
    label.textContent = season.label;
    const record = document.createElement("strong");
    record.textContent = `${season.stats.wins} 胜 ${season.stats.losses} 负`;
    title.append(label, record);

    const review = document.createElement("p");
    review.textContent = season.review;

    const facts = document.createElement("div");
    facts.className = "match-summary-facts";
    const values = [
      ["比赛", season.stats.matches],
      ["胜场", season.stats.wins],
      ["负场", season.stats.losses],
    ];
    if (season.stats.draws) values.push(["平局", season.stats.draws]);
    values.forEach(([name, value]) => {
      const item = document.createElement("span");
      item.innerHTML = `<small>${name}</small><strong>${value}</strong>`;
      facts.appendChild(item);
    });

    summary.replaceChildren(title, review, facts);
  }

  function createMatch(match) {
    const article = document.createElement("article");
    article.className = `match-record match-record--${match.result}`;

    const index = document.createElement("span");
    index.className = "match-record-index";
    index.textContent = String(match.number).padStart(2, "0");

    const context = document.createElement("div");
    context.className = "match-record-context";
    const series = document.createElement("span");
    series.textContent = match.series;
    const round = document.createElement("strong");
    round.textContent = match.round;
    context.append(series, round);

    const scoreboard = document.createElement("div");
    scoreboard.className = "match-scoreboard";
    const teamA = document.createElement("span");
    teamA.textContent = match.teamA;
    if (isQianli(match.teamA)) teamA.classList.add("is-qianli");
    const score = document.createElement("strong");
    score.textContent = match.score;
    const teamB = document.createElement("span");
    teamB.textContent = match.teamB;
    if (isQianli(match.teamB)) teamB.classList.add("is-qianli");
    scoreboard.append(teamA, score, teamB);

    const outcome = document.createElement("div");
    outcome.className = "match-record-outcome";
    const result = document.createElement("strong");
    result.textContent = resultLabels[match.result] || "-";
    outcome.appendChild(result);
    if (match.comment) {
      const note = document.createElement("p");
      note.textContent = match.comment;
      outcome.appendChild(note);
    }
    if (match.mvp) {
      const mvp = document.createElement("small");
      mvp.textContent = `MVP ${match.mvp}`;
      outcome.appendChild(mvp);
    }

    article.append(index, context, scoreboard, outcome);
    return article;
  }

  function renderSeason(seasonId) {
    const season = archive.seasons.find((item) => item.id === seasonId) || archive.seasons[0];
    tabs.querySelectorAll("button").forEach((button) => {
      const selected = button.dataset.matchSeason === season.id;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    renderSummary(season);
    list.replaceChildren(...season.matches.map(createMatch));
  }

  archive.seasons.forEach((season, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.role = "tab";
    button.dataset.matchSeason = season.id;
    button.textContent = season.id;
    button.className = index === 0 ? "is-active" : "";
    button.addEventListener("click", () => renderSeason(season.id));
    tabs.appendChild(button);
  });

  tabs.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...tabs.querySelectorAll("button")];
    const current = buttons.findIndex((button) => button.classList.contains("is-active"));
    let next = current;
    if (event.key === "ArrowLeft") next = (current - 1 + buttons.length) % buttons.length;
    if (event.key === "ArrowRight") next = (current + 1) % buttons.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = buttons.length - 1;
    buttons[next].focus();
    renderSeason(buttons[next].dataset.matchSeason);
  });

  renderSeason(archive.seasons[0].id);
})();
