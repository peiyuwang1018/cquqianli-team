(() => {
  const questions = Array.isArray(window.QIANLI_QA) ? window.QIANLI_QA : [];
  const list = document.querySelector("[data-qa-list]");
  const audienceSelect = document.querySelector("#qa-audience-filter");
  const groupSelect = document.querySelector("#qa-group-filter");
  const count = document.querySelector("[data-qa-count]");
  const empty = document.querySelector("[data-qa-empty]");
  const viewButtons = Array.from(document.querySelectorAll("[data-qa-view]"));
  const viewCopy = document.querySelector("[data-qa-view-copy]");
  const listHint = document.querySelector("[data-qa-list-hint]");
  const drawHint = document.querySelector("[data-qa-draw-hint]");
  const drawView = document.querySelector("[data-qa-draw-view]");
  const drawDeck = document.querySelector("[data-qa-draw-deck]");
  const drawCard = document.querySelector("[data-qa-draw-card]");
  const drawUnderlay = document.querySelector("[data-qa-draw-underlay]");
  const drawCategories = Array.from(document.querySelectorAll("[data-qa-draw-category]"));
  const drawNumbers = Array.from(document.querySelectorAll("[data-qa-draw-number]"));
  const drawEmoji = document.querySelector("[data-qa-draw-emoji]");
  const drawQuestionText = document.querySelector("[data-qa-draw-question]");
  const drawQuestionSide = document.querySelector("[data-qa-draw-question-side]");
  const drawAnswerSide = document.querySelector("[data-qa-draw-answer-side]");
  const drawAnswer = document.querySelector("[data-qa-draw-answer]");
  const drawStage = document.querySelector("[data-qa-draw-stage]");
  const drawFlip = document.querySelector("[data-qa-draw-flip]");
  const drawHistoryButton = document.querySelector("[data-qa-draw-history]");
  const drawNext = document.querySelector("[data-qa-draw-next]");
  const drawEmpty = document.querySelector("[data-qa-draw-empty]");
  const drawStatus = document.querySelector("[data-qa-draw-status]");

  if (!list || !audienceSelect || !groupSelect || !questions.length) return;

  const appendAnswer = (container, entries) => {
    entries.forEach((entry) => {
      if (typeof entry === "string") {
        const paragraph = document.createElement("p");
        paragraph.textContent = entry;
        container.append(paragraph);
        return;
      }

      if (entry?.type === "ordered-list" && Array.isArray(entry.items)) {
        const orderedList = document.createElement("ol");
        entry.items.forEach((text) => {
          const item = document.createElement("li");
          item.textContent = text;
          orderedList.append(item);
        });
        container.append(orderedList);
      }
    });
  };

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
    appendAnswer(answer, item.answer);

    details.append(summary, answer);
    return details;
  };

  const records = questions.map((question) => ({ question, element: createQuestion(question) }));
  list.replaceChildren(...records.map((record) => record.element));

  let visibleRecords = records;
  let currentRecord = null;
  let currentView = "draw";
  let cardSide = "question";
  let isDrawing = false;
  let queuedRecord = null;
  const drawHistory = [];

  const syncCardHeight = () => {
    if (!drawStage) return;
    const activeFace = cardSide === "answer" ? drawAnswerSide : drawQuestionSide;
    if (!activeFace) return;
    requestAnimationFrame(() => {
      drawStage.style.height = `${activeFace.scrollHeight}px`;
    });
  };

  const setCardSide = (side) => {
    cardSide = side === "answer" ? "answer" : "question";
    if (drawCard) drawCard.dataset.side = cardSide;
    if (drawQuestionSide) drawQuestionSide.setAttribute("aria-hidden", String(cardSide !== "question"));
    if (drawAnswerSide) drawAnswerSide.setAttribute("aria-hidden", String(cardSide !== "answer"));
    if (drawFlip) {
      drawFlip.innerHTML = cardSide === "question"
        ? '<i class="mdi mdi-card-account-details-outline" aria-hidden="true"></i><span>查看回答</span>'
        : '<i class="mdi mdi-undo-variant" aria-hidden="true"></i><span>返回问题</span>';
      drawFlip.setAttribute("aria-pressed", String(cardSide === "answer"));
    }
    syncCardHeight();
  };

  const randomIndex = (length) => {
    if (length <= 1) return 0;
    if (window.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % length;
    }
    return Math.floor(Math.random() * length);
  };

  const chooseRecord = (excludedRecord = currentRecord) => {
    const candidates = visibleRecords.length > 1
      ? visibleRecords.filter((record) => record !== excludedRecord)
      : visibleRecords;
    return candidates[randomIndex(candidates.length)] || null;
  };

  const fillUnderlay = (record) => {
    if (!drawUnderlay || !record) return;
    const item = record.question;
    const position = visibleRecords.indexOf(record) + 1;
    const category = drawUnderlay.querySelector("[data-qa-underlay-category]");
    const number = drawUnderlay.querySelector("[data-qa-underlay-number]");
    const emoji = drawUnderlay.querySelector("[data-qa-underlay-emoji]");
    const question = drawUnderlay.querySelector("[data-qa-underlay-question]");
    if (category) category.textContent = item.category;
    if (number) number.textContent = `CARD ${String(position).padStart(2, "0")} / ${String(visibleRecords.length).padStart(2, "0")}`;
    if (emoji) emoji.textContent = item.emoji;
    if (question) question.textContent = item.question;
  };

  const prepareUnderlay = () => {
    queuedRecord = chooseRecord(currentRecord);
    fillUnderlay(queuedRecord);
  };

  const updateHistoryButton = () => {
    if (drawHistoryButton) drawHistoryButton.disabled = isDrawing || drawHistory.length === 0;
  };

  const renderQuestion = (record, { prepareNext = true } = {}) => {
    currentRecord = record;
    const position = visibleRecords.indexOf(currentRecord) + 1;
    const item = currentRecord.question;

    drawCard.hidden = false;
    if (drawDeck) drawDeck.hidden = false;
    if (drawEmpty) drawEmpty.hidden = true;
    drawCategories.forEach((category) => { category.textContent = item.category; });
    drawNumbers.forEach((number) => { number.textContent = `CARD ${String(position).padStart(2, "0")} / ${String(visibleRecords.length).padStart(2, "0")}`; });
    if (drawEmoji) drawEmoji.textContent = item.emoji;
    if (drawQuestionText) drawQuestionText.textContent = item.question;
    drawAnswer.replaceChildren();
    appendAnswer(drawAnswer, item.answer);
    setCardSide("question");
    if (prepareNext) prepareUnderlay();
    updateHistoryButton();
    if (drawStatus) drawStatus.textContent = `已从 ${visibleRecords.length} 个问题中抽取一张。`;
  };

  const transitionToQuestion = (nextRecord, { rememberCurrent = true, direction = "forward" } = {}) => {
    if (!nextRecord || !drawCard) return;
    if (!currentRecord || drawCard.hidden) {
      renderQuestion(nextRecord);
      return;
    }

    if (rememberCurrent) drawHistory.push(currentRecord);
    isDrawing = true;
    if (drawNext) drawNext.disabled = true;
    updateHistoryButton();
    fillUnderlay(nextRecord);
    if (direction === "backward") {
      if (drawUnderlay) drawUnderlay.classList.add("is-returning");
    } else {
      if (drawUnderlay) drawUnderlay.classList.add("is-revealing");
    drawCard.classList.add("is-drawing-away");
    }

    window.setTimeout(() => {
      drawCard.classList.add("is-resetting");
      renderQuestion(nextRecord, { prepareNext: false });
      drawCard.classList.remove("is-drawing-away");
      if (drawUnderlay) drawUnderlay.classList.remove("is-revealing", "is-returning");
      prepareUnderlay();
      requestAnimationFrame(() => {
        drawCard.classList.remove("is-resetting");
        isDrawing = false;
        if (drawNext) drawNext.disabled = false;
        updateHistoryButton();
      });
    }, 440);
  };

  const drawQuestion = () => {
    if (!drawCard || !drawAnswer) return;
    if (isDrawing) return;

    if (!visibleRecords.length) {
      drawCard.hidden = true;
      if (drawDeck) drawDeck.hidden = true;
      if (drawEmpty) drawEmpty.hidden = false;
      if (drawStatus) drawStatus.textContent = "当前筛选条件下没有可抽取的问题。";
      currentRecord = null;
      queuedRecord = null;
      drawHistory.length = 0;
      updateHistoryButton();
      return;
    }

    const nextRecord = queuedRecord || chooseRecord();

    if (!currentRecord || drawCard.hidden) {
      renderQuestion(nextRecord);
      return;
    }

    transitionToQuestion(nextRecord);
  };

  const returnToPreviousQuestion = () => {
    if (isDrawing || !drawHistory.length) return;
    const previousRecord = drawHistory.pop();
    transitionToQuestion(previousRecord, { rememberCurrent: false, direction: "backward" });
  };

  const setView = (view) => {
    currentView = view === "draw" ? "draw" : "list";
    const isDraw = currentView === "draw";
    list.hidden = isDraw;
    if (drawView) drawView.hidden = !isDraw;
    if (empty) empty.hidden = isDraw || visibleRecords.length > 0;
    if (listHint) listHint.hidden = isDraw;
    if (drawHint) drawHint.hidden = !isDraw;
    if (viewCopy) {
      viewCopy.textContent = isDraw
        ? "从当前筛选结果中随机抽取一个问题，先想一想，再翻开队伍的回答。"
        : "按主题逐条浏览，需要时展开答案。";
    }

    viewButtons.forEach((button) => {
      const active = button.dataset.qaView === currentView;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (isDraw && (!currentRecord || !visibleRecords.includes(currentRecord))) drawQuestion();
  };

  const applyFilters = () => {
    const audience = audienceSelect.value;
    const group = groupSelect.value;

    visibleRecords = records.filter((record) => {
      const audiences = record.element.dataset.qaAudience.split(" ");
      const groups = record.element.dataset.qaGroups.split(" ");
      const audienceMatches = audience === "all" || audiences.includes(audience);
      const groupMatches = group === "all" || groups.includes(group);
      const visible = audienceMatches && groupMatches;
      record.element.hidden = !visible;
      if (!visible) record.element.open = false;
      return visible;
    });

    drawHistory.length = 0;
    queuedRecord = null;
    updateHistoryButton();

    if (count) count.textContent = `显示 ${visibleRecords.length} 条`;
    if (empty) {
      empty.hidden = currentView === "draw" || visibleRecords.length > 0;
      empty.textContent = "暂时没有同时符合这两个条件的问题。可以放宽一个筛选条件再看看。";
    }

    if (currentView === "draw") drawQuestion();
  };

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.qaView));
  });
  audienceSelect.addEventListener("change", applyFilters);
  groupSelect.addEventListener("change", applyFilters);
  drawFlip?.addEventListener("click", () => setCardSide(cardSide === "question" ? "answer" : "question"));
  drawHistoryButton?.addEventListener("click", returnToPreviousQuestion);
  drawNext?.addEventListener("click", drawQuestion);
  window.addEventListener("resize", syncCardHeight);

  applyFilters();
  setView("draw");
})();
