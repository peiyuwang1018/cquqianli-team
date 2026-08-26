(function () {
  "use strict";

  var data = window.QIANLI_SEASON_CALENDAR;
  var root = document.querySelector(".season-calendar");
  if (!data || !root) return;

  var MS_DAY = 86400000;
  var statusLabels = { confirmed: "已确认", tentative: "暂定", derived: "倒推" };
  var monthCursor = parseDate(data.season.defaultMonth + "-01");
  var activeCategories = new Set(Object.keys(data.categories));
  var selectedEvent = null;
  var monthGrid = root.querySelector("[data-calendar-month-grid]");
  var monthDetail = root.querySelector("[data-season-detail]");
  var progressDetail = root.querySelector("[data-progress-detail]");
  var overviewDetail = root.querySelector("[data-overview-detail]");
  var memoContainer = root.querySelector("[data-season-memo]");
  var tooltip = root.querySelector("[data-season-tooltip]");
  var progressWindowIndex = 0;

  function parseDate(value) {
    var parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2] || 1);
  }

  function isoDate(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function monthKey(date) {
    return isoDate(date).slice(0, 7);
  }

  function seasonMonths() {
    var months = [];
    var cursor = parseDate(data.season.start.slice(0, 7) + "-01");
    var end = parseDate(data.season.end.slice(0, 7) + "-01");
    while (cursor <= end) {
      months.push(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return months;
  }

  function addDays(date, amount) {
    var next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    next.setDate(next.getDate() + amount);
    return next;
  }

  function daysBetween(start, end) {
    return Math.round((end - start) / MS_DAY);
  }

  function formatDate(value) {
    var date = typeof value === "string" ? parseDate(value) : value;
    return date.getFullYear() + " 年 " + (date.getMonth() + 1) + " 月 " + date.getDate() + " 日";
  }

  function dateRange(event) {
    if (event.start === event.end) return formatDate(event.start);
    return formatDate(event.start) + " - " + formatDate(event.end);
  }

  function compactMonthLabel(date) {
    return (date.getMonth() + 1) + "月";
  }

  function fullMonthLabel(date) {
    return date.getFullYear() + " 年 " + (date.getMonth() + 1) + " 月";
  }

  function eventVisible(event) {
    return activeCategories.has(event.category);
  }

  function eventForId(id) {
    return data.events.find(function (event) { return event.id === id; });
  }

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function applyEventStyle(element, event) {
    element.style.setProperty("--event-color", data.categories[event.category].color);
    element.classList.add("season-event--" + event.status);
    if (event.importance === "major") element.classList.add("season-event--major");
    element.dataset.eventId = event.id;
  }

  function renderFilters() {
    var container = root.querySelector("[data-season-filters]");
    Object.keys(data.categories).forEach(function (key) {
      var category = data.categories[key];
      var button = createElement("button", "season-category-filter is-active");
      button.type = "button";
      button.dataset.category = key;
      button.setAttribute("aria-pressed", "true");
      button.style.setProperty("--category-color", category.color);
      button.innerHTML = '<i class="mdi ' + category.icon + '" aria-hidden="true"></i><span>' + category.label + "</span>";
      button.addEventListener("click", function () {
        if (activeCategories.has(key) && activeCategories.size === 1) return;
        if (activeCategories.has(key)) activeCategories.delete(key);
        else activeCategories.add(key);
        button.classList.toggle("is-active", activeCategories.has(key));
        button.setAttribute("aria-pressed", String(activeCategories.has(key)));
        renderMonth();
        renderProgressWindow();
        renderOverview();
      });
      container.appendChild(button);
    });
  }

  function eventsOnDate(date) {
    return data.events.filter(function (event) {
      return eventVisible(event) && date >= parseDate(event.start) && date <= parseDate(event.end);
    }).sort(function (left, right) {
      var durationDifference = daysBetween(parseDate(right.start), parseDate(right.end)) - daysBetween(parseDate(left.start), parseDate(left.end));
      if (durationDifference) return durationDifference;
      return left.start.localeCompare(right.start);
    });
  }

  function shouldShowLabel(event, date, firstDisplayedDate) {
    var start = parseDate(event.start);
    return isoDate(date) === event.start || date.getDay() === 1 || (date.getDate() === 1 && date >= firstDisplayedDate) || isoDate(date) === isoDate(firstDisplayedDate);
  }

  function renderMonth() {
    var key = monthKey(monthCursor);
    var firstDay = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    var mondayOffset = (firstDay.getDay() + 6) % 7;
    var firstDisplayedDate = addDays(firstDay, -mondayOffset);
    var monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    var lastOffset = 6 - ((monthEnd.getDay() + 6) % 7);
    var lastDisplayedDate = addDays(monthEnd, lastOffset);
    var totalDays = daysBetween(firstDisplayedDate, lastDisplayedDate) + 1;

    root.querySelector("[data-month-kicker]").textContent = monthCursor.getFullYear() + " / " + String(monthCursor.getMonth() + 1).padStart(2, "0");
    root.querySelector("[data-month-title]").textContent = monthCursor.getFullYear() + " 年 " + (monthCursor.getMonth() + 1) + " 月";
    root.querySelector("[data-month-line]").textContent = data.months[key] || "让这一月的工作与整个赛季保持联系。";

    var seasonStartMonth = data.season.start.slice(0, 7);
    var seasonEndMonth = data.season.end.slice(0, 7);
    root.querySelector("[data-month-prev]").disabled = key <= seasonStartMonth;
    root.querySelector("[data-month-next]").disabled = key >= seasonEndMonth;
    monthGrid.innerHTML = "";

    for (var index = 0; index < totalDays; index += 1) {
      var date = addDays(firstDisplayedDate, index);
      var cell = createElement("div", "season-day");
      if (date.getMonth() !== monthCursor.getMonth()) cell.classList.add("is-outside");
      if (isoDate(date) === isoDate(new Date())) cell.classList.add("is-today");
      var dayNumber = createElement("span", "season-day-number", String(date.getDate()));
      var eventList = createElement("div", "season-day-events");
      eventsOnDate(date).slice(0, 4).forEach(function (event) {
        var eventButton = createElement("button", "season-day-event", shouldShowLabel(event, date, firstDisplayedDate) ? event.shortTitle : "");
        eventButton.type = "button";
        eventButton.setAttribute("aria-label", event.title + "，" + dateRange(event));
        applyEventStyle(eventButton, event);
        eventList.appendChild(eventButton);
      });
      var eventCount = eventsOnDate(date).length;
      if (eventCount > 4) eventList.appendChild(createElement("span", "season-day-more", "+" + (eventCount - 4)));
      cell.appendChild(dayNumber);
      cell.appendChild(eventList);
      monthGrid.appendChild(cell);
    }

    var eventsThisMonth = data.events.filter(function (event) {
      return eventVisible(event) && parseDate(event.start) <= monthEnd && parseDate(event.end) >= firstDay;
    });
    if (!selectedEvent || !eventsThisMonth.some(function (event) { return event.id === selectedEvent.id; })) selectedEvent = eventsThisMonth[0] || null;
    renderDetail(monthDetail, selectedEvent, "本月没有启用的事件分类。可在上方重新打开分类。", eventsThisMonth);
    bindEventTargets(monthGrid, monthDetail);
  }

  function renderDetail(container, event, emptyText, relatedEvents, relatedLabel) {
    container.innerHTML = "";
    if (!event) {
      var empty = createElement("div", "season-detail-empty");
      empty.innerHTML = '<i class="mdi mdi-calendar-blank-outline" aria-hidden="true"></i><p>' + emptyText + "</p>";
      container.appendChild(empty);
      return;
    }
    var category = data.categories[event.category];
    container.style.setProperty("--event-color", category.color);
    var metaText = category.label + " / " + statusLabels[event.status];
    if (event.importance === "major") metaText += " / 重点标记";
    var meta = createElement("p", "season-detail-meta", metaText);
    var title = createElement("h4", "", event.title);
    var range = createElement("p", "season-detail-range", dateRange(event));
    var description = createElement("p", "season-detail-description", event.description);
    var source = createElement("p", "season-detail-source", "依据：" + event.source);
    container.appendChild(meta);
    container.appendChild(title);
    container.appendChild(range);
    container.appendChild(description);
    if (event.subevents && event.subevents.length) {
      var subevents = createElement("div", "season-detail-subevents");
      subevents.appendChild(createElement("p", "", "子活动"));
      event.subevents.forEach(function (subevent) {
        var item = createElement("div", "season-detail-subevent");
        var name = createElement("span", "");
        name.appendChild(createElement("strong", "", subevent.title));
        name.appendChild(createElement("em", "", subevent.english));
        item.appendChild(name);
        item.appendChild(createElement("small", "", subevent.dateLabel || "日期待定"));
        subevents.appendChild(item);
      });
      container.appendChild(subevents);
    }
    container.appendChild(source);

    if (relatedEvents && relatedEvents.length > 1) {
      var related = createElement("div", "season-detail-related");
      related.appendChild(createElement("p", "", relatedLabel || "本月节点"));
      relatedEvents.forEach(function (item) {
        var button = createElement("button", item.id === event.id ? "is-active" : "", item.shortTitle);
        button.type = "button";
        button.dataset.detailEventId = item.id;
        button.style.setProperty("--event-color", data.categories[item.category].color);
        related.appendChild(button);
      });
      related.addEventListener("click", function (clickEvent) {
        var button = clickEvent.target.closest("[data-detail-event-id]");
        if (!button) return;
        selectedEvent = eventForId(button.dataset.detailEventId);
        renderDetail(container, selectedEvent, emptyText, relatedEvents, relatedLabel);
      });
      container.appendChild(related);
    }
  }

  function bindEventTargets(container, detailContainer) {
    container.querySelectorAll("[data-event-id]").forEach(function (target) {
      target.addEventListener("click", function () {
        selectedEvent = eventForId(target.dataset.eventId);
        var monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
        var monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
        var related = data.events.filter(function (event) {
          return eventVisible(event) && parseDate(event.start) <= monthEnd && parseDate(event.end) >= monthStart;
        });
        renderDetail(detailContainer, selectedEvent, "", related);
      });
      target.addEventListener("mouseenter", showTooltip);
      target.addEventListener("mousemove", moveTooltip);
      target.addEventListener("mouseleave", hideTooltip);
      target.addEventListener("focus", showTooltip);
      target.addEventListener("blur", hideTooltip);
    });
  }

  function showTooltip(pointerEvent) {
    var event = eventForId(pointerEvent.currentTarget.dataset.eventId);
    if (!event) return;
    var importance = event.importance === "major" ? " · 重点标记" : "";
    tooltip.innerHTML = "<strong>" + event.title + "</strong><span>" + dateRange(event) + "</span><small>" + statusLabels[event.status] + " · " + data.categories[event.category].label + importance + "</small>";
    tooltip.hidden = false;
    moveTooltip(pointerEvent);
  }

  function moveTooltip(pointerEvent) {
    if (tooltip.hidden) return;
    var x = pointerEvent.clientX || pointerEvent.currentTarget.getBoundingClientRect().left;
    var y = pointerEvent.clientY || pointerEvent.currentTarget.getBoundingClientRect().bottom;
    var left = Math.min(window.innerWidth - 300, Math.max(12, x + 14));
    var top = Math.min(window.innerHeight - tooltip.offsetHeight - 12, Math.max(12, y + 14));
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  function progressTypeColor(type) {
    if (data.categories[type]) return data.categories[type].color;
    return "#68707b";
  }

  function progressAxis() {
    var seasonStart = parseDate(data.season.start);
    var seasonEnd = parseDate(data.season.end);
    var offset = 0;
    var items = seasonMonths().map(function (date) {
      var start = date < seasonStart ? seasonStart : date;
      var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      var end = addDays(nextMonth, -1) > seasonEnd ? seasonEnd : addDays(nextMonth, -1);
      var weight = (data.progressMonthWeights && data.progressMonthWeights[monthKey(date)]) || 1;
      var item = {
        date: date,
        start: start,
        end: end,
        days: daysBetween(start, end) + 1,
        weight: weight,
        offset: offset
      };
      offset += weight;
      return item;
    });
    return { items: items, total: offset, start: seasonStart, end: seasonEnd };
  }

  function progressPoint(date, axis) {
    if (date <= axis.start) return 0;
    if (date > axis.end) return 100;
    for (var index = 0; index < axis.items.length; index += 1) {
      var item = axis.items[index];
      if (date >= item.start && date <= item.end) {
        var fraction = daysBetween(item.start, date) / item.days;
        return (item.offset + fraction * item.weight) / axis.total * 100;
      }
    }
    return 100;
  }

  function progressRange(start, end, axis) {
    var left = progressPoint(start, axis);
    var right = progressPoint(addDays(end, 1), axis);
    return { left: left, width: Math.max(0.35, right - left) };
  }

  function showProgressStageTooltip(pointerEvent) {
    var stage = data.progressStages.find(function (item) { return item.id === pointerEvent.currentTarget.dataset.progressId; });
    if (!stage) return;
    tooltip.innerHTML = "<strong>" + stage.title + "</strong><span>" + dateRange(stage) + "</span><small>赛季主进度</small>";
    tooltip.hidden = false;
    moveTooltip(pointerEvent);
  }

  function showProgressHighlightTooltip(pointerEvent) {
    var highlight = data.progressHighlights.find(function (item) { return item.id === pointerEvent.currentTarget.dataset.progressHighlightId; });
    if (!highlight) return;
    tooltip.innerHTML = "<strong>" + highlight.title + "</strong><span>" + dateRange(highlight) + "</span><small>赛季重点窗口</small>";
    tooltip.hidden = false;
    moveTooltip(pointerEvent);
  }

  function renderProgress() {
    var monthsContainer = root.querySelector("[data-progress-months]");
    var track = root.querySelector("[data-progress-track]");
    var range = root.querySelector("[data-progress-anchor]");
    var months = seasonMonths();
    var axis = progressAxis();

    monthsContainer.innerHTML = "";
    axis.items.forEach(function (item) {
      var date = item.date;
      var button = createElement("button", "season-progress-month", compactMonthLabel(date));
      button.type = "button";
      button.dataset.jumpMonth = monthKey(date);
      button.style.width = (item.weight / axis.total * 100) + "%";
      button.setAttribute("aria-label", "查看" + fullMonthLabel(date));
      monthsContainer.appendChild(button);
    });

    track.innerHTML = "";
    data.progressStages.forEach(function (stage) {
      var segment = createElement("button", "season-progress-segment season-progress-segment--" + stage.type, stage.title);
      segment.type = "button";
      segment.dataset.progressId = stage.id;
      segment.style.setProperty("--progress-color", stage.color || progressTypeColor(stage.type));
      var stageRange = progressRange(parseDate(stage.start), parseDate(stage.end), axis);
      segment.style.left = stageRange.left + "%";
      segment.style.width = stageRange.width + "%";
      segment.setAttribute("aria-label", stage.title + "，" + dateRange(stage));
      segment.addEventListener("mouseenter", showProgressStageTooltip);
      segment.addEventListener("mousemove", moveTooltip);
      segment.addEventListener("mouseleave", hideTooltip);
      segment.addEventListener("focus", showProgressStageTooltip);
      segment.addEventListener("blur", hideTooltip);
      track.appendChild(segment);
    });
    data.progressHighlights.forEach(function (highlight) {
      var marker = createElement("button", "season-progress-highlight", highlight.title);
      var highlightRange = progressRange(parseDate(highlight.start), parseDate(highlight.end), axis);
      marker.type = "button";
      marker.dataset.progressHighlightId = highlight.id;
      marker.style.setProperty("--highlight-color", highlight.color || progressTypeColor(highlight.type));
      marker.style.left = highlightRange.left + "%";
      marker.style.width = highlightRange.width + "%";
      marker.setAttribute("aria-label", highlight.title + "，" + dateRange(highlight));
      marker.addEventListener("mouseenter", showProgressHighlightTooltip);
      marker.addEventListener("mousemove", moveTooltip);
      marker.addEventListener("mouseleave", hideTooltip);
      marker.addEventListener("focus", showProgressHighlightTooltip);
      marker.addEventListener("blur", hideTooltip);
      track.appendChild(marker);
    });
    track.appendChild(createElement("div", "season-progress-window"));

    range.max = String(Math.max(0, months.length - 3));
    range.value = String(Math.min(progressWindowIndex, Number(range.max)));
    bindMonthJumpTargets(monthsContainer);
    renderProgressWindow();
  }

  function renderProgressWindow() {
    var zoom = root.querySelector("[data-progress-zoom]");
    var range = root.querySelector("[data-progress-anchor]");
    var windowMarker = root.querySelector(".season-progress-window");
    if (!zoom || !range || !windowMarker) return;

    var months = seasonMonths();
    progressWindowIndex = Math.min(Number(range.value), Math.max(0, months.length - 3));
    var selectedMonths = months.slice(progressWindowIndex, progressWindowIndex + 3);
    var axis = progressAxis();
    var seasonStart = axis.start;
    var seasonEnd = axis.end;
    var windowStart = selectedMonths[0] < seasonStart ? seasonStart : selectedMonths[0];
    var afterWindow = new Date(selectedMonths[selectedMonths.length - 1].getFullYear(), selectedMonths[selectedMonths.length - 1].getMonth() + 1, 1);
    var windowEnd = addDays(afterWindow, -1) > seasonEnd ? seasonEnd : addDays(afterWindow, -1);
    var windowDays = daysBetween(windowStart, windowEnd) + 1;
    var label = fullMonthLabel(selectedMonths[0]) + " - " + compactMonthLabel(selectedMonths[selectedMonths.length - 1]);
    root.querySelector("[data-progress-window-label]").textContent = label;
    root.querySelector("[data-progress-window-title]").textContent = fullMonthLabel(selectedMonths[0]) + "至" + compactMonthLabel(selectedMonths[selectedMonths.length - 1]);
    var markerRange = progressRange(windowStart, windowEnd, axis);
    windowMarker.style.left = markerRange.left + "%";
    windowMarker.style.width = markerRange.width + "%";

    zoom.innerHTML = "";
    var ruler = createElement("div", "season-progress-zoom-ruler");
    ruler.appendChild(createElement("div", "season-progress-zoom-corner", "三个月窗口"));
    var rulerMonths = createElement("div", "season-progress-zoom-months");
    selectedMonths.forEach(function (date) {
      var button = createElement("button", "", fullMonthLabel(date));
      button.type = "button";
      button.dataset.jumpMonth = monthKey(date);
      rulerMonths.appendChild(button);
    });
    ruler.appendChild(rulerMonths);
    zoom.appendChild(ruler);

    [
      { categories: ["research"], label: "研发周期" },
      { categories: ["training", "competition"], label: "演练与比赛" }
    ].forEach(function (lane) {
      var row = createElement("div", "season-progress-zoom-row");
      row.appendChild(createElement("div", "season-progress-zoom-label", lane.label));
      var laneTrack = createElement("div", "season-progress-zoom-track");
      data.events.filter(function (event) {
        return eventVisible(event) && lane.categories.includes(event.category) && parseDate(event.start) <= windowEnd && parseDate(event.end) >= windowStart;
      }).forEach(function (event, eventIndex) {
        var visibleStart = parseDate(event.start) < windowStart ? windowStart : parseDate(event.start);
        var visibleEnd = parseDate(event.end) > windowEnd ? windowEnd : parseDate(event.end);
        var bar = createElement("button", "season-progress-zoom-bar", event.shortTitle);
        bar.type = "button";
        applyEventStyle(bar, event);
        bar.style.left = (daysBetween(windowStart, visibleStart) / windowDays * 100) + "%";
        bar.style.width = ((daysBetween(visibleStart, visibleEnd) + 1) / windowDays * 100) + "%";
        bar.style.top = (11 + (eventIndex % 2) * 25) + "px";
        bar.setAttribute("aria-label", event.title + "，" + dateRange(event));
        laneTrack.appendChild(bar);
      });
      row.appendChild(laneTrack);
      zoom.appendChild(row);
    });

    var windowEvents = data.events.filter(function (event) {
      return eventVisible(event) && ["research", "training", "competition"].includes(event.category) && parseDate(event.start) <= windowEnd && parseDate(event.end) >= windowStart;
    });
    if (!selectedEvent || !windowEvents.some(function (event) { return event.id === selectedEvent.id; })) selectedEvent = windowEvents[0] || null;
    renderDetail(progressDetail, selectedEvent, "这个窗口内没有启用的研发、演练或比赛事件。", windowEvents, "窗口节点");
    bindOverviewTargets(zoom, progressDetail);
    bindMonthJumpTargets(zoom);
  }

  function renderOverview() {
    var container = root.querySelector("[data-season-overview]");
    var start = parseDate(data.season.start);
    var end = parseDate(data.season.end);
    var seasonDays = daysBetween(start, end) + 1;
    container.innerHTML = "";

    var ruler = createElement("div", "season-overview-ruler");
    ruler.appendChild(createElement("div", "season-overview-corner", "RM 2027"));
    var months = createElement("div", "season-overview-months");
    var cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      var segmentStart = cursor < start ? start : cursor;
      var nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      var segmentEnd = addDays(nextMonth, -1) > end ? end : addDays(nextMonth, -1);
      var segment = createElement("button", "", (cursor.getMonth() + 1) + "月");
      segment.type = "button";
      segment.dataset.jumpMonth = monthKey(cursor);
      segment.setAttribute("aria-label", "查看" + fullMonthLabel(cursor));
      segment.style.width = ((daysBetween(segmentStart, segmentEnd) + 1) / seasonDays * 100) + "%";
      months.appendChild(segment);
      cursor = nextMonth;
    }
    ruler.appendChild(months);
    container.appendChild(ruler);

    data.lanes.forEach(function (lane) {
      var row = createElement("div", "season-overview-row");
      var label = createElement("div", "season-overview-label", lane.label);
      var track = createElement("div", "season-overview-track");
      var laneSlots = [];
      data.events.filter(function (event) {
        return eventVisible(event) && event.lane === lane.id;
      }).sort(function (a, b) {
        return parseDate(a.start) - parseDate(b.start) || parseDate(a.end) - parseDate(b.end);
      }).forEach(function (event) {
        var eventStart = parseDate(event.start);
        var eventEnd = parseDate(event.end);
        var isMilestone = event.start === event.end || daysBetween(eventStart, eventEnd) <= 1;
        var item = createElement("button", isMilestone ? "season-overview-marker" : "season-overview-bar", isMilestone ? "" : event.shortTitle);
        item.type = "button";
        item.setAttribute("aria-label", event.title + "，" + dateRange(event));
        applyEventStyle(item, event);
        var left = daysBetween(start, eventStart) / seasonDays * 100;
        item.style.left = left + "%";
        if (isMilestone) {
          item.innerHTML = '<i class="mdi mdi-diamond-outline" aria-hidden="true"></i>';
        } else {
          var slotIndex = laneSlots.findIndex(function (slotEnd) { return slotEnd < eventStart; });
          if (slotIndex === -1) slotIndex = laneSlots.length;
          laneSlots[slotIndex] = eventEnd;
          item.style.width = Math.max(0.8, (daysBetween(eventStart, eventEnd) + 1) / seasonDays * 100) + "%";
          item.style.top = (8 + slotIndex * 24) + "px";
        }
        track.appendChild(item);
      });
      if (laneSlots.length > 2) {
        var laneHeight = Math.max(76, 12 + laneSlots.length * 24);
        row.style.minHeight = laneHeight + "px";
        track.style.minHeight = laneHeight + "px";
      }
      row.appendChild(label);
      row.appendChild(track);
      container.appendChild(row);
    });

    bindOverviewTargets(container, overviewDetail);
    bindMonthJumpTargets(container);
    var firstVisible = data.events.find(eventVisible);
    renderDetail(overviewDetail, selectedEvent && eventVisible(selectedEvent) ? selectedEvent : firstVisible, "当前没有启用的事件分类。");
  }

  function renderMemo() {
    if (!memoContainer) return;
    memoContainer.innerHTML = "";
    var memoStatusLabels = { confirmed: "已确认", tentative: "暂定", pending: "待公布" };
    data.officialMemo.forEach(function (item, index) {
      var row = createElement("article", "season-memo-item season-memo-item--" + item.status);
      var number = createElement("span", "season-memo-number");
      var icon = createElement("i", "mdi " + (item.icon || "mdi-calendar-check-outline"));
      icon.setAttribute("aria-hidden", "true");
      number.appendChild(icon);
      number.appendChild(createElement("small", "", String(index + 1).padStart(2, "0")));
      var main = createElement("div", "season-memo-main");
      main.appendChild(createElement("h4", "", item.title));
      main.appendChild(createElement("p", "season-memo-date", item.dateLabel));
      var status = createElement("span", "season-memo-status", memoStatusLabels[item.status] || item.status);
      var note = createElement("p", "season-memo-note", item.note);
      row.appendChild(number);
      row.appendChild(main);
      row.appendChild(status);
      row.appendChild(note);
      memoContainer.appendChild(row);
    });
  }

  function bindOverviewTargets(container, detailContainer) {
    container.querySelectorAll("[data-event-id]").forEach(function (target) {
      target.addEventListener("click", function () {
        selectedEvent = eventForId(target.dataset.eventId);
        renderDetail(detailContainer || overviewDetail, selectedEvent, "");
      });
      target.addEventListener("mouseenter", showTooltip);
      target.addEventListener("mousemove", moveTooltip);
      target.addEventListener("mouseleave", hideTooltip);
      target.addEventListener("focus", showTooltip);
      target.addEventListener("blur", hideTooltip);
    });
  }

  function activateView(view) {
    root.classList.toggle("is-memo-view", view === "memo");
    document.querySelectorAll("[data-season-view]").forEach(function (item) {
      var active = item.dataset.seasonView === view;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    root.querySelectorAll("[data-season-panel]").forEach(function (panel) {
      var active = panel.dataset.seasonPanel === view;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
    if (view === "progress") renderProgressWindow();
    if (view === "month") renderMonth();
    if (view === "node") renderOverview();
    if (view === "memo") renderMemo();
  }

  function jumpToMonth(key) {
    monthCursor = parseDate(key + "-01");
    selectedEvent = null;
    activateView("month");
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindMonthJumpTargets(container) {
    container.querySelectorAll("[data-jump-month]").forEach(function (button) {
      button.addEventListener("click", function () { jumpToMonth(button.dataset.jumpMonth); });
    });
  }

  root.querySelector("[data-month-prev]").addEventListener("click", function () {
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1);
    selectedEvent = null;
    renderMonth();
  });

  root.querySelector("[data-month-next]").addEventListener("click", function () {
    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
    selectedEvent = null;
    renderMonth();
  });

  root.querySelector("[data-progress-anchor]").addEventListener("input", function (event) {
    progressWindowIndex = Number(event.currentTarget.value);
    selectedEvent = null;
    renderProgressWindow();
  });

  document.querySelectorAll("[data-season-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      activateView(button.dataset.seasonView);
    });
  });

  renderFilters();
  renderMonth();
  renderProgress();
  renderOverview();
  renderMemo();
}());
