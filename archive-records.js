(() => {
  const archive = window.QIANLI_MATCH_ARCHIVE;
  const root = document.querySelector("[data-match-archive]");
  if (!archive?.seasons?.length || !root) return;

  const tabs = root.querySelector("[data-match-season-tabs]");
  const summary = root.querySelector("[data-match-season-summary]");
  const list = root.querySelector("[data-match-list]");
  const scope = root.querySelector("[data-match-scope]");
  const resultLabels = { win: "胜", loss: "负", draw: "平" };
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
    const values = [
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
    const redTeam = document.createElement("span");
    redTeam.className = "match-team match-team--red";
    redTeam.textContent = match.redTeam;
    if (match.redTeam.includes("重庆大学")) redTeam.classList.add("is-qianli");
    const score = document.createElement("strong");
    score.className = "match-score";
    const [redScore = "-", blueScore = "-"] = match.score.split(":");
    score.innerHTML = `<span class="match-score--red">${redScore}</span><b>:</b><span class="match-score--blue">${blueScore}</span>`;
    const blueTeam = document.createElement("span");
    blueTeam.className = "match-team match-team--blue";
    blueTeam.textContent = match.blueTeam;
    if (match.blueTeam.includes("重庆大学")) blueTeam.classList.add("is-qianli");
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

  function renderSeason(seasonId) {
    const season = archive.seasons.find((item) => item.id === seasonId) || archive.seasons[0];
    tabs.querySelectorAll("button").forEach((button) => {
      const selected = button.dataset.matchSeason === season.id;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    renderSummary(season);
    if (season.matches.length) {
      list.replaceChildren(...season.matches.map(createMatch));
    } else {
      const empty = document.createElement("p");
      empty.className = "match-list-empty";
      empty.textContent = "本赛季暂无 RMUC 超级对抗赛比赛记录。";
      list.replaceChildren(empty);
    }
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
