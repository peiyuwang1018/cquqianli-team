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
  var overviewDetail = root.querySelector("[data-overview-detail]");
  var tooltip = root.querySelector("[data-season-tooltip]");

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

  function renderDetail(container, event, emptyText, relatedEvents) {
    container.innerHTML = "";
    if (!event) {
      var empty = createElement("div", "season-detail-empty");
      empty.innerHTML = '<i class="mdi mdi-calendar-blank-outline" aria-hidden="true"></i><p>' + emptyText + "</p>";
      container.appendChild(empty);
      return;
    }
    var category = data.categories[event.category];
    container.style.setProperty("--event-color", category.color);
    var meta = createElement("p", "season-detail-meta", category.label + " / " + statusLabels[event.status]);
    var title = createElement("h4", "", event.title);
    var range = createElement("p", "season-detail-range", dateRange(event));
    var description = createElement("p", "season-detail-description", event.description);
    var source = createElement("p", "season-detail-source", "依据：" + event.source);
    container.appendChild(meta);
    container.appendChild(title);
    container.appendChild(range);
    container.appendChild(description);
    container.appendChild(source);

    if (relatedEvents && relatedEvents.length > 1) {
      var related = createElement("div", "season-detail-related");
      related.appendChild(createElement("p", "", "本月节点"));
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
        renderDetail(container, selectedEvent, emptyText, relatedEvents);
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
    tooltip.innerHTML = "<strong>" + event.title + "</strong><span>" + dateRange(event) + "</span><small>" + statusLabels[event.status] + " · " + data.categories[event.category].label + "</small>";
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
      var segment = createElement("span", "", (cursor.getMonth() + 1) + "月");
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
      data.events.filter(function (event) {
        return eventVisible(event) && event.lane === lane.id;
      }).forEach(function (event, index) {
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
          item.style.width = Math.max(0.8, (daysBetween(eventStart, eventEnd) + 1) / seasonDays * 100) + "%";
          item.style.top = (12 + (index % 2) * 27) + "px";
        }
        track.appendChild(item);
      });
      row.appendChild(label);
      row.appendChild(track);
      container.appendChild(row);
    });

    bindOverviewTargets(container);
    var firstVisible = data.events.find(eventVisible);
    renderDetail(overviewDetail, selectedEvent && eventVisible(selectedEvent) ? selectedEvent : firstVisible, "当前没有启用的事件分类。");
  }

  function bindOverviewTargets(container) {
    container.querySelectorAll("[data-event-id]").forEach(function (target) {
      target.addEventListener("click", function () {
        selectedEvent = eventForId(target.dataset.eventId);
        renderDetail(overviewDetail, selectedEvent, "");
      });
      target.addEventListener("mouseenter", showTooltip);
      target.addEventListener("mousemove", moveTooltip);
      target.addEventListener("mouseleave", hideTooltip);
      target.addEventListener("focus", showTooltip);
      target.addEventListener("blur", hideTooltip);
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

  root.querySelectorAll("[data-season-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      var view = button.dataset.seasonView;
      root.querySelectorAll("[data-season-view]").forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      root.querySelectorAll("[data-season-panel]").forEach(function (panel) {
        var active = panel.dataset.seasonPanel === view;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
      if (view === "overview") renderOverview();
    });
  });

  renderFilters();
  renderMonth();
  renderOverview();
}());
