# 内容更新操作卡（CONTENT-SOP）

> 适用：给官网加新闻、改名单、改日历、换图片。
> 一页纸，照着做即可。详细规范见 `AGENT.md`。

---

## 一、三步走

```powershell
# 1) 改文件（见下方对照表）
# 2) 检查本地引用是否完整
node scripts/check-site.js

# 3) 提交并推送（两个远端都要推）
git add -A
git commit -m "更新：<一句话说明>"
git push origin main
git push fork main
```

推送后：
- `fork` → GitHub Pages，约 1–2 分钟生效；
- `origin` → GitHub Actions 增量部署到 OSS，约 50 秒生效。

---

## 二、改什么 → 动哪里 → 必改哪个版本号

| 要改的内容 | 数据文件 | 必须同步改 `?v=` 的页面 |
| --- | --- | --- |
| 千里要闻（新闻） | `assets/js/data/qianli-news.js` | `season/index.html`、`season/news.html`、`season/archive.html` |
| 备赛日历 / 活动预告 | `assets/js/data/season-calendar.js` | `season/calendar.html`、`season/events.html` |
| 现任成员 / 历届名单 | `assets/js/data/members.js` | `season/members.html`、`museum/alumni.html` |
| 荣誉墙 | `assets/js/data/honors.js` | `museum/honors.html`、`index.html` |
| 千里札记 | `assets/js/data/qianli-articles.js` | `articles/index.html` |
| 招新 Q&A | `assets/js/data/qa-data.js` | `join/qa.html` |
| 资料站课程 | `assets/js/data/training-data.js` | `museum/training/*.html` |
| 纯页面文案 | 直接改对应 `.html` | 该页引用的 `styles.css?v=` 或脚本 `?v=` |

**版本号写法**：把 `?v=20260909-1` 改成当天的，例如 `?v=20261126-1`。

> 不改版本号会怎样：内容确实更新了，但访客浏览器仍然用缓存里的旧文件，看起来“没更新”。这是最常见的坑。

---

## 三、改新闻的标准格式

在 `qianli-news.js` 的 `items` 数组**最前面**插入一条（越新的排越前）：

```js
{
  id: "news-2026-11-26-示例标题",
  type: "news",
  category: "活动",            // 赛季 / 队伍 / 研发 / 活动 / 招新
  season: "2027",
  date: "2026-11-26",
  dateLabel: "2027 赛季 · 一句话场景",
  sortKey: "2026-11-26",
  title: "新闻标题",
  summary: "一两句话摘要，会显示在卡片上。",
  image: "assets/images/content/news/2026-11-26-slug-01.jpg",
  thumbnail: "assets/images/content/news/2026-11-26-slug-01.jpg",
  imageFit: "cover",
  imageAlt: "图片说明",
  images: [
    { src: "assets/images/content/news/2026-11-26-slug-01.jpg", full: "…同上…", alt: "图1", caption: "图1 说明", fit: "cover" },
  ],
  sourceLabel: "重庆大学千里战队",
  status: "活动已结束",
  paragraphs: ["第一段……", "第二段……"],
  facts: [["活动时间", "2026 年 11 月 26 日"], ["地点", "重庆大学虎溪校区"]],
  primaryUrl: "join/index.html",
  primaryLabel: "前往纳新通道",
}
```

图片放 `assets/images/content/news/`，文件名用 `日期-英文短名-序号.jpg`，**不要用外链**。

---

## 四、发布前自检清单

- [ ] `node scripts/check-site.js` 通过（59 个页面）
- [ ] 改了数据文件的，对应页面的 `?v=` 已更新
- [ ] 新图片文件名全小写、无空格、无中文
- [ ] 本地起服务看一眼实际效果：`python -m http.server 4180`（在仓库根目录）
- [ ] 推送了 `origin` 和 `fork` 两个远端
- [ ] 推送 1 分钟后打开线上页确认（`Ctrl+F5`）

---

## 五、内容红线（来自 AGENT.md）

1. 不猜数据：成员履历、奖项、日期、合作方，缺事实就标注“待核验”；
2. 不公开手机号、私人邮箱、学号；
3. `OnlyPupPet` 是本人指定的公开显示名，不要改回真名；
4. 导航只能改 `scripts/build-navigation.js`，再运行生成器，不要手改生成结果；
5. 合作伙伴/赞助商 Logo 不得重绘、拉伸、改结构。
