(() => {
  const archive = window.QIANLI_MATCH_ARCHIVE;
  const root = document.querySelector("[data-match-archive]");
  if (!archive?.seasons?.length || !root) return;

  const yearSelect = root.querySelector("[data-match-year]");
  const stageSelect = root.querySelector("[data-match-stage]");
  const count = root.querySelector("[data-match-count]");
  const summary = root.querySelector("[data-match-season-summary]");
  const list = root.querySelector("[data-match-list]");
  const scope = root.querySelector("[data-match-scope]");
  const resultLabels = { win: "胜", loss: "负", draw: "平" };
  const stageFilters = [
    { value: "rmul", label: "RMUL" },
    { value: "rmuc", label: "RMUC" },
    { value: "rmuc-regional", label: "RMUC区域赛" },
    { value: "rmuc-national", label: "RMUC国赛阶段" },
  ];
  const allMatches = archive.seasons.flatMap((season) => season.matches.map((match) => {
    const competition = match.competition || "RMUC";
    const stage = match.stage || match.series || "其他赛段";
    return {
      ...match,
      season: match.season || season.id,
      competition,
      stage,
      stageId: match.stageId || `${competition}-${stage}`,
    };
  }));
  let lightboxItems = [];
  let lightboxIndex = 0;

  if (scope && archive.scope) scope.textContent = archive.scope;

  const lightbox = document.createElement("dialog");
  lightbox.className = "match-media-lightbox";
  lightbox.innerHTML = `
    <div class="match-media-lightbox__inner">
      <button class="match-media-lightbox__close" type="button" aria-label="关闭大图"><i class="mdi mdi-close" aria-hidden="true"></i></button>
      <button class="match-media-lightbox__arrow match-media-lightbox__arrow--prev" type="button" aria-label="上一张"><i class="mdi mdi-chevron-left" aria-hidden="true"></i></button>
      <figure>
        <img alt="" data-match-lightbox-image />
        <figcaption><span data-match-lightbox-title></span><small data-match-lightbox-counter></small></figcaption>
      </figure>
      <button class="match-media-lightbox__arrow match-media-lightbox__arrow--next" type="button" aria-label="下一张"><i class="mdi mdi-chevron-right" aria-hidden="true"></i></button>
    </div>`;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector("[data-match-lightbox-image]");
  const lightboxTitle = lightbox.querySelector("[data-match-lightbox-title]");
  const lightboxCounter = lightbox.querySelector("[data-match-lightbox-counter]");
  const previousButton = lightbox.querySelector(".match-media-lightbox__arrow--prev");
  const nextButton = lightbox.querySelector(".match-media-lightbox__arrow--next");

  function updateLightbox() {
    const item = lightboxItems[lightboxIndex];
    if (!item) return;
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxTitle.textContent = item.title;
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
    const hasMultiple = lightboxItems.length > 1;
    previousButton.hidden = !hasMultiple;
    nextButton.hidden = !hasMultiple;
  }

  function openLightbox(items) {
    lightboxItems = items;
    lightboxIndex = 0;
    updateLightbox();
    document.body.classList.add("has-match-lightbox");
    lightbox.showModal();
  }

  function moveLightbox(direction) {
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    updateLightbox();
  }

  lightbox.querySelector(".match-media-lightbox__close").addEventListener("click", () => lightbox.close());
  previousButton.addEventListener("click", () => moveLightbox(-1));
  nextButton.addEventListener("click", () => moveLightbox(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("close", () => document.body.classList.remove("has-match-lightbox"));
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && lightboxItems.length > 1) moveLightbox(-1);
    if (event.key === "ArrowRight" && lightboxItems.length > 1) moveLightbox(1);
  });

  function createRecordFragment(season) {
    const fragment = document.createDocumentFragment();
    const win = document.createElement("span");
    win.className = "is-wins";
    win.textContent = `${season.stats.wins} 胜`;
    const loss = document.createElement("span");
    loss.className = "is-losses";
    loss.textContent = `${season.stats.losses} 负`;
    fragment.append(win, loss);
    if (season.stats.draws) {
      const draw = document.createElement("span");
      draw.className = "is-draws";
      draw.textContent = `${season.stats.draws} 平`;
      fragment.append(draw);
    }
    return fragment;
  }

  function renderSummary(season) {
    const title = document.createElement("div");
    title.className = "match-summary-title";
    const label = document.createElement("span");
    label.textContent = season.label;
    const record = document.createElement("strong");
    record.appendChild(createRecordFragment(season));
    title.append(label, record);

    const review = document.createElement("p");
    review.textContent = season.review;

    const facts = document.createElement("div");
    facts.className = "match-summary-facts";
    const winRate = season.stats.matches ? (season.stats.wins / season.stats.matches) * 100 : 0;
    const winRateText = `${Number.isInteger(winRate) ? winRate.toFixed(0) : winRate.toFixed(1)}%`;
    const values = [
      ["胜率", winRateText, "is-win-rate"],
      ["比赛", season.stats.matches, "is-matches"],
      ["胜场", season.stats.wins, "is-wins"],
      ["负场", season.stats.losses, "is-losses"],
    ];
    if (season.stats.draws) values.push(["平局", season.stats.draws, "is-draws"]);
    values.forEach(([name, value, className]) => {
      const item = document.createElement("span");
      item.className = className;
      const key = document.createElement("small");
      key.textContent = name;
      const number = document.createElement("strong");
      number.textContent = value;
      item.append(key, number);
      facts.appendChild(item);
    });

    summary.replaceChildren(title, review, facts);
  }

  function createMediaButton(match, images, label, icon) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "match-media-trigger";
    button.title = `查看${label}大图`;
    const thumbnail = document.createElement("img");
    thumbnail.src = images[0];
    thumbnail.alt = "";
    thumbnail.loading = "lazy";
    const text = document.createElement("span");
    text.innerHTML = `<i class="mdi ${icon}" aria-hidden="true"></i><b>${label}</b><small>${images.length}</small>`;
    button.append(thumbnail, text);
    button.addEventListener("click", () => {
      openLightbox(images.map((src, index) => ({
        src,
        alt: `${match.season} ${match.round} ${label} ${index + 1}`,
        title: `${match.season} ${match.round} · ${label}`,
      })));
    });
    return button;
  }

  function createTeamName(team, side) {
    const parts = team.trim().split(/\s+/);
    const schoolName = parts.shift() || "待补充";
    const teamName = parts.join(" ") || "战队名称待补充";
    const wrapper = document.createElement("div");
    wrapper.className = `match-team match-team--${side}`;
    wrapper.title = team;
    if (team.includes("重庆大学")) wrapper.classList.add("is-qianli");

    const school = document.createElement("span");
    school.className = "match-team__school";
    school.textContent = schoolName;
    const name = document.createElement("strong");
    name.className = "match-team__name";
    name.textContent = teamName;
    wrapper.append(school, name);
    return wrapper;
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
    series.textContent = `${match.competition} · ${match.stage}`;
    const round = document.createElement("strong");
    round.textContent = match.round;
    context.append(series, round);

    const scoreboard = document.createElement("div");
    scoreboard.className = "match-scoreboard";
    const redTeam = createTeamName(match.redTeam, "red");
    const score = document.createElement("strong");
    score.className = "match-score";
    const [redScore = "-", blueScore = "-"] = match.score.split(":");
    score.innerHTML = `<span class="match-score--red">${redScore}</span><b>:</b><span class="match-score--blue">${blueScore}</span>`;
    const blueTeam = createTeamName(match.blueTeam, "blue");
    scoreboard.append(redTeam, score, blueTeam);

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

    const actions = document.createElement("div");
    actions.className = "match-record-actions";
    if (match.dataPanels?.length) {
      actions.appendChild(createMediaButton(match, match.dataPanels, "小局数据", "mdi-chart-box-outline"));
    }
    if (match.mvpImages?.length) {
      actions.appendChild(createMediaButton(match, match.mvpImages, "MVP", "mdi-account-star-outline"));
    }
    if (match.videoUrl) {
      const video = document.createElement("a");
      video.className = "match-video-link";
      video.href = match.videoUrl;
      video.target = "_blank";
      video.rel = "noopener noreferrer";
      video.title = "在哔哩哔哩观看比赛录像";
      video.setAttribute("aria-label", "在哔哩哔哩观看比赛录像");
      video.innerHTML = '<i class="mdi mdi-play-circle-outline" aria-hidden="true"></i>';
      actions.appendChild(video);
    }
    outcome.appendChild(actions);

    article.append(index, context, scoreboard, outcome);
    return article;
  }

  function fillSelect(select, values, allLabel) {
    const options = [new Option(allLabel, "all")];
    values.forEach(({ value, label }) => options.push(new Option(label, value)));
    select.replaceChildren(...options);
  }

  function matchesStageFilter(match, filter) {
    if (filter === "all") return true;
    if (filter === "rmul") return match.competition === "RMUL";
    if (filter === "rmuc") return match.competition === "RMUC";
    if (filter === "rmuc-regional") return match.competition === "RMUC" && /赛区/.test(match.stage);
    if (filter === "rmuc-national") return match.competition === "RMUC" && !/赛区/.test(match.stage);
    return true;
  }

  function buildSummary(matches) {
    const selectedYear = yearSelect.value;
    const selectedStage = stageSelect.value;
    const stageLabel = stageSelect.options[stageSelect.selectedIndex]?.textContent || "全部比赛";
    const stats = matches.reduce((totals, match) => {
      totals.matches += 1;
      if (match.result === "win") totals.wins += 1;
      if (match.result === "loss") totals.losses += 1;
      if (match.result === "draw") totals.draws += 1;
      return totals;
    }, { matches: 0, wins: 0, losses: 0, draws: 0 });
    const labels = [];
    labels.push(selectedYear === "all" ? "全部年份" : `${selectedYear} 赛季`);
    labels.push(stageLabel);
    const reviews = [...new Set(matches.map((match) => match.seasonReview).filter(Boolean))];
    return {
      label: labels.join(" · "),
      review: reviews.length === 1
        ? reviews[0]
        : `共收录 ${stats.matches} 场公开比赛记录，可继续按年份与赛段缩小范围。`,
      stats,
    };
  }

  function renderArchive() {
    const selectedYear = yearSelect.value;
    const selectedStage = stageSelect.value;
    const matches = allMatches.filter((match) => (
      (selectedYear === "all" || match.season === selectedYear)
      && matchesStageFilter(match, selectedStage)
    ));
    renderSummary(buildSummary(matches));
    count.textContent = `${matches.length} 场`;
    if (matches.length) {
      list.replaceChildren(...matches.map(createMatch));
    } else {
      const empty = document.createElement("p");
      empty.className = "match-list-empty";
      empty.textContent = "当前筛选条件下暂无比赛记录。";
      list.replaceChildren(empty);
    }
  }

  fillSelect(yearSelect, archive.seasons.map((season) => ({ value: season.id, label: `${season.id} 赛季` })), "全部年份");
  fillSelect(stageSelect, stageFilters, "全部比赛");
  yearSelect.addEventListener("change", renderArchive);
  stageSelect.addEventListener("change", renderArchive);
  renderArchive();
})();
