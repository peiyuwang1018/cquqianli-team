# cquqianli-team

重庆大学千里战队官方网站，规划域名：`team.cquqianli.cn`。

## 目录结构

```text
.
├─ index.html              # 首页
├─ about/                  # 关于千里与组织架构
├─ season/                 # 千里要闻与备赛日历
├─ groups/                 # 技术组、责任组与兵种组
├─ museum/                 # 资料、影像、队史与留言
├─ join/                   # 招新与加入方式
├─ contact/                # 联系方式
├─ scripts/                # 本地维护与链接检查工具
└─ assets/
   ├─ css/                 # 全站样式
   ├─ fonts/               # 本地字体
   ├─ images/
   │  ├─ brand/            # 战队品牌与组别图标
   │  ├─ content/          # 页面内容图片
   │  └─ partners/         # 鸣谢与合作方标识
   └─ js/
      ├─ core/             # 全站公共逻辑
      ├─ pages/            # 页面专用交互
      └─ data/             # 页面内容与配置数据
```

子页面统一位于一级栏目目录，并通过 `<base href="../" />` 从站点根目录解析导航和资源路径。

修改页面路径或资源后，可运行 `node scripts/check-site.js` 检查全站本地链接。
