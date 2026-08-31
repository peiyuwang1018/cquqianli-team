/*
 * 千璃小助手文案配置。
 * 后续调整小人说的话时，优先只修改本文件，不改组件逻辑。
 *
 * 规则：
 * 1. 首页第一次点击固定显示 home.first，之后从 home.messages 中抽取小贴士。
 * 2. pages 中的精确页面配置优先于 sections；页面第一句就是 messages[0]，不再问候。
 * 3. pages 的键使用相对网站根目录的 HTML 路径；sections 用于尚未单独配置的同类页面。
 * 4. href 与 label 同时存在时，气泡下方才显示跳转入口。
 */
window.QIANLI_MASCOT_CONFIG = Object.freeze({
  heat: {
    perClick: 22,
    threshold: 100,
    coolingPerSecond: 22,
    overheatMessage: "累死我了，不理你了。",
  },

  home: {
    first: { text: "你好，我是千璃，你的小助手。" },
    messages: [
      { text: "首页第三屏的常用入口，能带你快速认识这个网站。", href: "#home-discover", label: "去常用入口" },
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
    ],
  },

  pages: {
    "join/index.html": {
      messages: [
        { text: "先看看五个技术组分别在解决什么问题，再决定从哪里开始。", href: "join/index.html#groups", label: "查看组别岗位" },
        { text: "准备投递前，记得去加入我们页面完成一次自检。", href: "join/guide.html#self-check-title", label: "开始投递自检" },
      ],
    },
    "join/guide.html": {
      messages: [
        { text: "这里的面试指南条目很有可能在面试过程中聊到！", href: "join/guide.html#self-check-title", label: "查看面试指南" },
        { text: "自检清单不是门槛，它只是帮你确认自己是否准备好认真投入。", href: "join/guide.html#self-check-title", label: "查看自检清单" },
        { text: "面试时把事实、过程和自己的判断讲清楚，比漂亮话更重要。", href: "join/guide.html#interview-notes-title", label: "查看面试须知" },
      ],
    },
    "join/persona.html": {
      messages: [
        { text: "我们在意的不只是已有技能，也在意你面对问题和团队的方式。" },
        { text: "暂时不会并不可怕，愿意学习、能够交付才会让能力持续增长。" },
      ],
    },
    "join/qa.html": {
      messages: [
        { text: "问题很多时，按 Ctrl+F 可以直接搜索关键词。" },
        { text: "如果这里没有你的问题，带着具体背景来问，会更容易得到有效回答。" },
        { text: "涉及时间和批次的信息，请以纳新通道的最新公告为准。", href: "join/index.html", label: "返回纳新通道" },
      ],
    },
    "about/management.html": {
      messages: [
        { text: "制度的价值，是让协作更稳定，也让经验能够被下一届接住。", href: "https://sop.cquqianli.cn/", label: "打开千里 SOP" },
        { text: "明确责任、交付节点和复盘方式，复杂项目才不会只靠记忆运转。" },
      ],
    },
    "season/calendar.html": {
      messages: [
        { text: "日历中的参考窗口会随官方通知校准，安排工作时记得预留缓冲。" },
        { text: "切换视角后，网址中的井号会保留你当前查看的位置。" },
      ],
    },
    "museum/resources.html": {
      messages: [
        { text: "公开资料站只收录适合对外展示和学习的内容。" },
        { text: "第一次了解 RoboMaster，可以先从比赛规则和参赛指南开始。" },
      ],
    },
    "museum/projects.html": {
      messages: [
        { text: "这里保存比赛、项目与成员档案，标签页可以直接用网址定位。" },
        { text: "过去的记录不只是结果，也是在替后来者保存上下文。" },
      ],
    },
    "museum/gallery.html": {
      messages: [
        { text: "照片墙的筛选条件可以帮你更快找到某个赛季和场景。" },
        { text: "刷新页面不会丢失当前标签页，网址中的井号会替你记住。" },
      ],
    },
    "museum/hall-of-fame.html": {
      messages: [
        { text: "名人堂记录的是人与贡献；历届成员的完整名单在档案馆里。" },
        { text: "每一段被留下的经历，都会成为后来者理解千里的入口。" },
      ],
    },
  },

  sections: [
    {
      match: "/groups/",
      messages: [
        { text: "先理解这个组解决的问题，再判断自己愿不愿意长期练习这些能力。" },
        { text: "页面底部可以直接跳到对应组别的成员名单。" },
      ],
    },
    {
      match: "/about/",
      messages: [
        { text: "这里讲的是千里如何形成、如何协作，以及为什么坚持到今天。" },
        { text: "想了解具体分工，可以继续前往团队架构。", href: "about/organization.html", label: "查看团队架构" },
      ],
    },
    {
      match: "/season/",
      messages: [
        { text: "赛季信息会持续更新，关键时间仍请以官方通知为准。" },
        { text: "你可以从要闻、成员和备赛日历三个角度了解当前赛季。" },
      ],
    },
    {
      match: "/museum/",
      messages: [
        { text: "千里博物馆保存队伍的作品、记录、人物与共同记忆。" },
        { text: "如果迷路了，回到博物馆首页看看八个入口。", href: "museum/index.html", label: "返回博物馆首页" },
      ],
    },
    {
      match: "/join/",
      messages: [
        { text: "投递之前，先确认自己了解岗位，也愿意为学习和协作留出时间。" },
        { text: "不确定从哪里准备，可以先完成加入我们页面的自检。", href: "join/guide.html", label: "查看加入我们" },
      ],
    },
    {
      match: "/contact/",
      messages: [
        { text: "合作沟通时，请尽量说明目标、时间、资源和预期交付。" },
        { text: "具体的赞助与活动合作方式，可以在当前页面继续了解。" },
      ],
    },
  ],

  fallback: {
    messages: [
      { text: "这里还有很多细节，慢慢看，不用急着一次读完。" },
    ],
  },
});
