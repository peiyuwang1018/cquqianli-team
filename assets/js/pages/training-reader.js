(function () {
  const root = document.querySelector("[data-training-document]");
  if (!root) return;

  const readLessons = () => {
    if (window.QIANLI_TRAINING_LESSONS) return window.QIANLI_TRAINING_LESSONS;
    const node = document.querySelector("#qianli-training-data");
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch {
      return null;
    }
  };

  const key = document.body.dataset.trainingKey;
  const lesson = readLessons()?.[key]?.lesson;
  if (!lesson?.sourceHref && !lesson?.fallbackHtml) {
    root.innerHTML = "<p>该课程内容暂未整理完成。</p>";
    return;
  }

  const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const imageMap = {
    "图片和附件/image.png": "assets/documents/training/vision/images/01.png",
    "图片和附件/image%201.png": "assets/documents/training/vision/images/02.png",
    "图片和附件/image%203.png": "assets/documents/training/vision/images/03.png",
    "图片和附件/image%202.png": "assets/documents/training/vision/images/04.png"
  };

  function inline(source) {
    return source
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `<img src="${imageMap[src] || src}" alt="${alt}" loading="lazy" />`)
      .replace(/\[([^\]]+)\]\(([^)]*)\)/g, (_, text, href) => {
        const target = href || (/^https?:\/\//.test(text) ? text : "");
        return target
          ? `<a href="${target}" target="_blank" rel="noopener noreferrer">${text}</a>`
          : text;
      })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function renderMarkdown(markdown) {
    const lines = escapeHtml(markdown.replace(/\r\n/g, "\n")).split("\n");
    const html = [];
    let paragraph = [];
    let listType = "";
    let quote = [];
    let code = [];
    let table = [];
    let inCode = false;

    const flushParagraph = () => {
      if (paragraph.length) html.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    };
    const closeList = () => {
      if (listType) html.push(`</${listType}>`);
      listType = "";
    };
    const flushQuote = () => {
      if (quote.length) html.push(`<blockquote>${inline(quote.join("<br />"))}</blockquote>`);
      quote = [];
    };
    const flushTable = () => {
      if (!table.length) return;
      const rows = table
        .filter((row) => !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(row))
        .map((row, rowIndex) => {
          const cells = row.replace(/^\||\|$/g, "").split("|").map((cell) => inline(cell.trim()));
          const tag = rowIndex === 0 ? "th" : "td";
          return `<tr>${cells.map((cell) => `<${tag}>${cell}</${tag}>`).join("")}</tr>`;
        })
        .join("");
      html.push(`<table>${rows}</table>`);
      table = [];
    };

    lines.forEach((line) => {
      if (line.startsWith("```")) {
        flushParagraph(); closeList(); flushQuote(); flushTable();
        if (inCode) {
          html.push(`<pre><code>${code.join("\n")}</code></pre>`);
          code = [];
        }
        inCode = !inCode;
        return;
      }
      if (inCode) { code.push(line); return; }
      if (!line.trim()) { flushParagraph(); closeList(); flushQuote(); flushTable(); return; }

      if (/^\|.+\|$/.test(line.trim())) {
        flushParagraph(); closeList(); flushQuote();
        table.push(line.trim());
        return;
      }

      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        flushParagraph(); closeList(); flushQuote(); flushTable();
        const level = Math.min(heading[1].length + 1, 5);
        html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
        return;
      }
      if (line.startsWith("> ")) {
        flushParagraph(); closeList(); flushTable(); quote.push(line.slice(2)); return;
      }
      const unordered = line.match(/^[-*+]\s+(.+)$/);
      const ordered = line.match(/^\d+[.)]\s+(.+)$/);
      if (unordered || ordered) {
        flushParagraph(); flushQuote(); flushTable();
        const nextType = ordered ? "ol" : "ul";
        if (listType !== nextType) { closeList(); listType = nextType; html.push(`<${listType}>`); }
        html.push(`<li>${inline((unordered || ordered)[1])}</li>`);
        return;
      }
      paragraph.push(line.trim());
    });
    flushParagraph(); closeList(); flushQuote(); flushTable();
    return html.join("");
  }

  if (lesson.fallbackHtml) {
    root.innerHTML = lesson.fallbackHtml;
  }

  if (!lesson.sourceHref) return;

  fetch(lesson.sourceHref)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((markdown) => { root.innerHTML = renderMarkdown(markdown); })
    .catch(() => {
      if (!lesson.fallbackHtml) {
        root.innerHTML = '<p class="training-document-fallback">第一课内容加载失败，请从资料站重新进入或稍后再试。</p>';
      }
    });
})();
