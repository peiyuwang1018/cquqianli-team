(() => {
  const widget = document.querySelector("[data-home-mascot]");
  const trigger = widget?.querySelector("[data-home-mascot-trigger]");
  const bubble = widget?.querySelector("[data-home-mascot-bubble]");
  const closeButton = widget?.querySelector("[data-home-mascot-close]");
  const messageNode = widget?.querySelector("[data-home-mascot-message]");
  const link = widget?.querySelector("[data-home-mascot-link]");
  const linkLabel = widget?.querySelector("[data-home-mascot-link-label]");

  if (!widget || !trigger || !bubble || !closeButton || !messageNode || !link || !linkLabel) return;

  const messages = [
    { text: "第一次来？首页第三屏的常用入口，能带你快速认识这个网站。", href: "#home-discover", label: "去常用入口" },
    { text: "面试不用背标准答案。讲清楚你怎么想、怎么学，比硬猜可靠。", href: "join/guide.html#interview-notes-title", label: "查看面试须知" },
    { text: "作品不一定要完整，过程记录、失败复盘和学习笔记也能说明很多问题。", href: "join/guide.html#self-check-title", label: "完成投递自检" },
    { text: "提前测试设备，别让麦克风比你先参加面试。", href: "join/guide.html#interview-notes-title", label: "阅读面试准备" },
    { text: "不知道选哪个组？先读组别介绍，再带着具体问题来问。", href: "join/index.html#groups", label: "查看技术组岗位" },
    { text: "想找以前的队员和故事？他们被好好收在千里博物馆里。", href: "museum/alumni.html", label: "查看历届成员" },
    { text: "右上角的白天模式，需要一点勇气。" },
    { text: "停着二十秒不动，首页会认真提醒你休息一下。" },
    { text: "我只是坐在这里，监督你有没有认真看网页。" },
    { text: "运筹帷幄之前，先把文件名和版本号写清楚。" },
    { text: "今天也要记得保存文件。机器人不会自己长好，网页也不会。" },
    { text: "做工程时，不知道就直说；知道一点，也要说明边界。" },
  ];

  let currentIndex = -1;
  let hideTimer = 0;

  const pickNextIndex = () => {
    if (messages.length < 2) return 0;
    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) nextIndex = Math.floor(Math.random() * messages.length);
    return nextIndex;
  };

  const renderMessage = () => {
    currentIndex = pickNextIndex();
    const item = messages[currentIndex];
    messageNode.textContent = item.text;
    if (item.href && item.label) {
      link.href = item.href;
      linkLabel.textContent = item.label;
      link.hidden = false;
    } else {
      link.hidden = true;
      link.removeAttribute("href");
      linkLabel.textContent = "";
    }
  };

  const openBubble = () => {
    window.clearTimeout(hideTimer);
    renderMessage();
    bubble.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => bubble.classList.add("is-visible"));
  };

  const closeBubble = ({ returnFocus = false } = {}) => {
    window.clearTimeout(hideTimer);
    bubble.classList.remove("is-visible");
    trigger.setAttribute("aria-expanded", "false");
    hideTimer = window.setTimeout(() => {
      bubble.hidden = true;
      if (returnFocus) trigger.focus();
    }, 220);
  };

  const hop = () => {
    trigger.classList.remove("is-hopping");
    void trigger.offsetWidth;
    trigger.classList.add("is-hopping");
  };

  trigger.addEventListener("click", () => {
    hop();
    if (trigger.getAttribute("aria-expanded") === "true") renderMessage();
    else openBubble();
  });

  trigger.addEventListener("animationend", () => trigger.classList.remove("is-hopping"));
  closeButton.addEventListener("click", () => closeBubble({ returnFocus: true }));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
      closeBubble({ returnFocus: true });
    }
  });
})();
