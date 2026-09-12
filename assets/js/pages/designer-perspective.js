(() => {
  const priorityExplorer = document.querySelector("[data-priority-explorer]");
  if (priorityExplorer) {
    const profiles = {
      arm: {
        title: "机械臂关节",
        metrics: [["刚度", 100], ["回差", 92], ["重量", 82], ["包络", 72], ["走线", 64]],
      },
      gimbal: {
        title: "云台",
        metrics: [["回差", 100], ["重量", 92], ["包络", 86], ["刚度", 78], ["防护", 58]],
      },
      feeder: {
        title: "拨弹机构",
        metrics: [["连续性", 100], ["抗卡滞", 94], ["维护", 82], ["公差", 74], ["重量", 48]],
      },
      suspension: {
        title: "底盘悬挂",
        metrics: [["冲击", 100], ["防护", 94], ["可靠性", 90], ["异物侵入", 82], ["维护", 68]],
      },
    };
    const title = priorityExplorer.querySelector("[data-priority-title]");
    const list = priorityExplorer.querySelector("[data-priority-list]");
    const buttons = [...priorityExplorer.querySelectorAll("[data-priority-profile]")];
    const level = (score) => score >= 90 ? "高" : score >= 70 ? "较高" : "中";
    const render = (key) => {
      const profile = profiles[key];
      if (!profile || !title || !list) return;
      title.textContent = profile.title;
      list.innerHTML = profile.metrics.map(([name, score]) => (
        `<li style="--priority: ${score}%"><span>${name}</span><i></i><b>${level(score)}</b></li>`
      )).join("");
      buttons.forEach((button) => {
        const active = button.dataset.priorityProfile === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    };
    buttons.forEach((button) => button.addEventListener("click", () => render(button.dataset.priorityProfile)));
  }

  const playground = document.querySelector("[data-tradeoff-playground]");
  if (playground) {
    const inputs = [...playground.querySelectorAll("[data-tradeoff-input]")];
    const insight = playground.querySelector("[data-tradeoff-insight]");
    const labels = { mass: "质量控制", stiffness: "刚度", serviceability: "可维护性" };
    const state = Object.fromEntries(inputs.map((input) => [input.dataset.tradeoffInput, Number(input.value)]));
    const sync = () => {
      inputs.forEach((input) => {
        const key = input.dataset.tradeoffInput;
        input.value = state[key];
        const output = playground.querySelector(`[data-tradeoff-output="${key}"]`);
        if (output) output.value = state[key];
      });
      const ranked = Object.entries(state).sort((a, b) => b[1] - a[1]);
      if (insight) insight.textContent = `当前更偏向${labels[ranked[0][0]]}；${labels[ranked[1][0]]}与${labels[ranked[2][0]]}共同承担这次取舍。`;
    };
    inputs.forEach((input) => input.addEventListener("input", () => {
      const changed = input.dataset.tradeoffInput;
      const otherKeys = Object.keys(state).filter((key) => key !== changed);
      const next = Number(input.value);
      const remaining = 100 - next;
      const previousOtherTotal = state[otherKeys[0]] + state[otherKeys[1]];
      let first = Math.round(remaining * state[otherKeys[0]] / previousOtherTotal);
      first = Math.max(10, Math.min(remaining - 10, first));
      state[changed] = next;
      state[otherKeys[0]] = first;
      state[otherKeys[1]] = remaining - first;
      sync();
    }));
    sync();
  }

  const functionMap = document.querySelector("[data-function-map]");
  if (functionMap) {
    const descriptions = {
      load: ["主力流", "主体首先要把载荷连续地传回安装边界。"],
      bearing: ["轴承座", "孔、挡肩与主体共同确定轴承的位置和受力边界。"],
      motor: ["电机安装", "安装面和孔系把驱动器直接纳入主体包络。"],
      cable: ["走线约束", "结构边界同时为线束提供路径和固定位置。"],
      protection: ["防护边界", "外轮廓承担异物隔离和碰撞保护。"],
    };
    const buttons = [...functionMap.querySelectorAll("[data-function-target]")];
    const regions = [...functionMap.querySelectorAll("[data-function-region]")];
    const caption = functionMap.querySelector("[data-function-caption]");
    const activate = (key) => {
      buttons.forEach((button) => {
        const active = button.dataset.functionTarget === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      regions.forEach((region) => region.classList.toggle("is-active", region.dataset.functionRegion === key));
      if (caption && descriptions[key]) {
        caption.innerHTML = `<strong>${descriptions[key][0]}：</strong>${descriptions[key][1]}`;
      }
    };
    buttons.forEach((button) => {
      button.addEventListener("click", () => activate(button.dataset.functionTarget));
      button.addEventListener("pointerenter", () => activate(button.dataset.functionTarget));
      button.addEventListener("focus", () => activate(button.dataset.functionTarget));
    });
    activate("load");
  }

  const deleteExperiment = document.querySelector("[data-delete-experiment]");
  if (deleteExperiment) {
    const questions = {
      fastener: "删掉一颗螺丝后，剩余预紧力和夹紧力分布是否仍满足要求？",
      location: "删除定位特征后，重新装配时的关键几何关系由什么保证？",
      rib: "删除这条加强筋后，主要力流是否仍然连续，局部变形会怎样变化？",
      guard: "删除防护边后，碰撞与异物侵入路径发生了什么变化？",
      cable: "删除走线固定点后，线束在运动、振动和维护时由什么约束？",
    };
    const buttons = [...deleteExperiment.querySelectorAll("[data-delete-target]")];
    const question = deleteExperiment.querySelector("[data-delete-question] p");
    buttons.forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.deleteTarget;
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      if (question) question.textContent = questions[key];
    }));
  }

  const stabilityBuilder = document.querySelector("[data-stability-builder]");
  if (stabilityBuilder) {
    const fields = [...stabilityBuilder.querySelectorAll("[data-stability-field]")];
    const result = stabilityBuilder.querySelector("[data-stability-result]");
    const render = () => {
      const values = Object.fromEntries(fields.map((field) => [field.dataset.stabilityField, field.value]));
      if (result) {
        result.textContent = `在${values.duration}内，面对${values.disturbance}扰动，使${values.metric}保持在允许变化范围。`;
      }
    };
    fields.forEach((field) => field.addEventListener("change", render));
    render();
  }

  const responseLab = document.querySelector("[data-response-lab]");
  if (responseLab) {
    const tabs = [...responseLab.querySelectorAll("[data-response-view]")];
    const panels = [...responseLab.querySelectorAll("[data-response-panel]")];
    const cycle = responseLab.querySelector("[data-task-cycle]");
    const output = responseLab.querySelector("[data-cycle-output]");
    const verdict = responseLab.querySelector("[data-response-verdict]");
    const taskLine = responseLab.querySelector("[data-task-line]");
    const showPanel = (view) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.responseView === view;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-pressed", String(active));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.responsePanel !== view;
      });
    };
    const updateCycle = () => {
      if (!cycle) return;
      const seconds = Number(cycle.value);
      const x = 54 + (seconds / 10) * 634;
      if (taskLine) taskLine.setAttribute("d", `M${x} 28V248`);
      if (output) output.value = `${seconds} s`;
      if (!verdict) return;
      if (seconds < 2) {
        verdict.textContent = `任务周期为 ${seconds} s：A 与 B 都还没有进入允许带。`;
      } else if (seconds < 8) {
        verdict.textContent = `任务周期为 ${seconds} s：A 可以进入允许带，B 仍未完成收敛。`;
      } else {
        verdict.textContent = `任务周期为 ${seconds} s：A 与 B 最终都可接受，但瞬态过程依然不同。`;
      }
    };
    tabs.forEach((tab) => tab.addEventListener("click", () => showPanel(tab.dataset.responseView)));
    cycle?.addEventListener("input", updateCycle);
    showPanel("motion");
    updateCycle();
  }

  const assemblyCase = document.querySelector("[data-assembly-case]");
  if (assemblyCase) {
    const buttons = [...assemblyCase.querySelectorAll("[data-assembly-step]")];
    const reveal = assemblyCase.querySelector("[data-assembly-reveal]");
    const messages = {
      cause: "结构原因：关键零件没有确定定位，安装位置、紧固顺序和人工调整共同进入最终结果。",
      solution: "加入定位肩、定位销和统一加工基准后，装配关系由几何特征决定，两组散布开始收敛。",
    };
    buttons.forEach((button) => button.addEventListener("click", () => {
      const step = button.dataset.assemblyStep;
      const solved = step === "solution";
      assemblyCase.classList.toggle("is-located", solved);
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      if (reveal) reveal.textContent = messages[step];
    }));
  }

  const failureTree = document.querySelector("[data-failure-tree]");
  if (failureTree) {
    const root = failureTree.querySelector("[data-failure-root]");
    const branches = failureTree.querySelector("[data-failure-branches]");
    const branchButtons = [...failureTree.querySelectorAll("[data-failure-branch]")];
    const outcome = failureTree.querySelector("[data-failure-outcome]");
    const paths = {
      feeder: ["Loose nut", "Falls into feeder", "Jamming", "Feeding unavailable"],
      pcb: ["Loose nut", "Falls onto PCB", "Short circuit", "Hardware failure"],
    };
    root?.addEventListener("click", () => {
      if (!branches) return;
      branches.hidden = false;
      root.classList.add("is-active");
      root.setAttribute("aria-expanded", "true");
    });
    branchButtons.forEach((button) => button.addEventListener("click", () => {
      const path = paths[button.dataset.failureBranch];
      branchButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      if (outcome && path) {
        outcome.innerHTML = path.map((node, index) => (
          `${index ? '<i class="mdi mdi-arrow-right" aria-hidden="true"></i>' : ''}<strong>${node}</strong>`
        )).join("");
      }
    }));
  }

  const testLadder = document.querySelector("[data-test-ladder]");
  if (testLadder) {
    const steps = [...testLadder.querySelectorAll("[data-test-step]")];
    const bar = testLadder.querySelector("[data-envelope-bar]");
    const value = testLadder.querySelector("[data-envelope-value]");
    const list = testLadder.querySelector("[data-disturbance-list]");
    const disturbances = [
      ["基础功能"],
      ["基础功能", "负载"],
      ["基础功能", "负载", "温升", "装配差异"],
      ["基础功能", "负载", "温升", "装配差异", "振动", "维护循环"],
      ["基础功能", "负载", "温升", "装配差异", "振动", "维护循环", "对抗冲击", "异物"],
    ];
    const render = (step) => {
      const percent = (step + 1) * 20;
      steps.forEach((button) => {
        const active = Number(button.dataset.testStep) === step;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (bar) bar.style.setProperty("--envelope", `${percent}%`);
      if (value) value.textContent = `${percent}%`;
      if (list) list.innerHTML = disturbances[step].map((item) => `<span>${item}</span>`).join("");
    };
    steps.forEach((button) => button.addEventListener("click", () => render(Number(button.dataset.testStep))));
    render(0);
  }

  const foreignObject = document.querySelector("[data-foreign-object]");
  if (foreignObject) {
    const buttons = [...foreignObject.querySelectorAll("[data-gap-design]")];
    const stage = foreignObject.querySelector("[data-gap-stage]");
    const slider = foreignObject.querySelector("[data-gap-position]");
    const result = foreignObject.querySelector("[data-gap-result]");
    let design = "trap";
    const update = () => {
      const position = Number(slider?.value || 0);
      stage?.style.setProperty("--ball-position", `${position}%`);
      if (!result) return;
      if (position < 20) {
        result.textContent = "弹丸尚未进入机构。";
      } else if (design === "block") {
        result.textContent = "入口尺寸阻止弹丸进入，运动机构保持隔离。";
      } else if (position < 70) {
        result.textContent = design === "trap" ? "弹丸正在进入危险间隙。" : "弹丸正沿着导向面接近排出口。";
      } else if (design === "trap") {
        result.textContent = "弹丸进入后被困在运动件之间，可能造成卡滞。";
      } else {
        result.textContent = "弹丸沿排出路径离开运动区域，没有被困住。";
      }
    };
    buttons.forEach((button) => button.addEventListener("click", () => {
      design = button.dataset.gapDesign;
      if (stage) stage.dataset.gapStage = design;
      if (slider) slider.value = "0";
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      update();
    }));
    slider?.addEventListener("input", update);
    update();
  }

  const openSourceQuestionLab = document.querySelector("[data-open-source-question-lab]");
  if (openSourceQuestionLab) {
    const questions = {
      why: {
        kicker: "Q1 · WHY DOES IT EXIST?",
        heading: "支撑旋转",
        copy: "轴承座让轴获得确定的旋转支撑，并把载荷传入主体结构。",
        parts: ["bearing", "housing"],
        note: "先理解它为什么存在，再讨论尺寸和实现方式。",
      },
      relation: {
        kicker: "Q2 · HOW IS IT CONNECTED?",
        heading: "恢复结构关系",
        copy: "轴、轴承、壳体和挡圈不是四个孤立零件，而是一条定位、承载与限位关系链。",
        parts: ["shaft", "bearing", "housing", "retainer"],
        note: "沿着载荷、定位和运动约束，把零件重新读成关系。",
      },
      implementation: {
        kicker: "Q3 · WHY IS IT MADE THIS WAY?",
        heading: "解释为什么这样实现",
        copy: "轴承直径、壳体挡肩、挡圈形式、材料与加工方式共同决定最终几何。",
        parts: ["bearing", "housing", "retainer"],
        note: "尺寸和形状是设计判断的结果，不是脱离工况的标准答案。",
      },
      change: {
        kicker: "Q4 · WHAT CHANGES WITH IT?",
        heading: "追踪变化传播",
        copy: "轴承直径增大后，壳体孔、挡肩、挡圈与轴配合都需要重新复核。",
        parts: ["shaft", "bearing", "housing", "retainer"],
        note: "能追踪一个变量改变后的连锁影响，才是真正读懂了设计。",
      },
    };
    const buttons = [...openSourceQuestionLab.querySelectorAll("[data-open-source-question]")];
    const parts = [...openSourceQuestionLab.querySelectorAll("[data-open-source-part]")];
    const kicker = openSourceQuestionLab.querySelector("[data-open-source-question-kicker]");
    const heading = openSourceQuestionLab.querySelector("[data-open-source-question-heading]");
    const copy = openSourceQuestionLab.querySelector("[data-open-source-question-copy]");
    const note = openSourceQuestionLab.querySelector("[data-open-source-change-note]");
    const slider = openSourceQuestionLab.querySelector("[data-open-source-bearing-scale]");
    const output = openSourceQuestionLab.querySelector("[data-open-source-bearing-output]");
    const bearingRings = [...openSourceQuestionLab.querySelectorAll("[data-bearing-radius]")];
    let activeQuestion = "why";

    const renderQuestion = (key) => {
      const question = questions[key];
      if (!question) return;
      activeQuestion = key;
      buttons.forEach((button) => {
        const active = button.dataset.openSourceQuestion === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      parts.forEach((part) => {
        part.classList.toggle("is-active", question.parts.includes(part.dataset.openSourcePart));
      });
      if (kicker) kicker.textContent = question.kicker;
      if (heading) heading.textContent = question.heading;
      if (copy) copy.textContent = question.copy;
      if (note && Number(slider?.value || 0) === 0) note.textContent = question.note;
    };

    const renderScale = () => {
      const percent = Number(slider?.value || 0);
      if (output) output.value = `+${percent}%`;
      bearingRings.forEach((ring) => {
        const base = Number(ring.dataset.bearingRadius);
        ring.setAttribute("r", String(base * (1 + percent / 100)));
      });
      parts.forEach((part) => {
        part.classList.toggle("is-affected", percent > 0);
      });
      if (note) {
        note.textContent = percent > 0
          ? `轴承直径增加 ${percent}%：壳体孔、挡肩和挡圈几何必须跟着变化，轴配合也要重新确认。`
          : questions[activeQuestion].note;
      }
    };

    buttons.forEach((button) => button.addEventListener("click", () => {
      renderQuestion(button.dataset.openSourceQuestion);
    }));
    slider?.addEventListener("input", () => {
      if (Number(slider.value) > 0 && activeQuestion !== "change") renderQuestion("change");
      renderScale();
    });
    renderQuestion("why");
    renderScale();
  }

  const theoryToolbox = document.querySelector("[data-theory-toolbox]");
  if (theoryToolbox) {
    const buttons = [...theoryToolbox.querySelectorAll("[data-theory-tool]")];
    const panels = [...theoryToolbox.querySelectorAll("[data-theory-panel]")];

    const activate = (key, focus = false) => {
      buttons.forEach((button) => {
        const active = button.dataset.theoryTool === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        if (active && focus) button.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.theoryPanel === key;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => activate(button.dataset.theoryTool));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = buttons.length - 1;
        else if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (index + 1) % buttons.length;
        else nextIndex = (index - 1 + buttons.length) % buttons.length;
        activate(buttons[nextIndex].dataset.theoryTool, true);
      });
    });

    activate(buttons[0]?.dataset.theoryTool || "01");
  }
})();
