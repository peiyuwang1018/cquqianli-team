const galleryRecords = window.QIANLI_GALLERY_RECORDS || {};

function robotRecord(season, archiveTitle, robot) {
  const record = galleryRecords[season]?.find((item) => item.title === archiveTitle) || {};
  return { ...robot, archiveTitle, record: record.record || "", legacy: record.legacy || "" };
}

function designPhotoSeries(prefix, labels, credit, altPrefix) {
  return labels.map((meta, index) => ({
    src: `assets/images/content/archive/gallery/designs/${prefix}-${String(index + 1).padStart(2, "0")}.webp`,
    alt: `${altPrefix}：${meta}`,
    meta,
    credit
  }));
}

function designPhotoSet(prefix, photos, altPrefix) {
  return photos.map((photo, index) => ({
    src: `assets/images/content/archive/gallery/designs/${prefix}-${String(photo.file || index + 1).padStart(2, "0")}.webp`,
    alt: `${altPrefix}：${photo.meta}`,
    meta: photo.meta,
    credit: photo.credit
  }));
}

function activityPhotoSeries(collection, prefix, photos, altPrefix) {
  return photos.map((photo, index) => ({
    src: `assets/images/content/archive/gallery/${collection}/2026/${prefix}-${String(index + 1).padStart(2, "0")}.webp`,
    alt: `${altPrefix}：${photo.meta}`,
    meta: `${photo.code} · ${photo.meta}`
  }));
}

window.QIANLI_GALLERY = {
  seasons: [
    {
      id: "2025",
      label: "RMUC 2025",
      description: "2025 赛季机器人阵容。选择任一机器人查看图片与队史档案。",
      robots: [
        robotRecord("2025", "三摩擦英雄机器人", { title: "三摩擦英雄机器人", meta: "RMUC 2025 · 英雄", cutout: "assets/images/content/archive/gallery/robots/2025/cutouts/hero-1.png", photo: "assets/images/content/archive/gallery/robots/2025/cutouts/hero-1.png", scale: 0.97 }),
        robotRecord("2025", "工程机器人", { title: "工程机器人", meta: "RMUC 2025 · 工程", cutout: "assets/images/content/archive/gallery/robots/2025/cutouts/engineer-2.png", photo: "assets/images/content/archive/gallery/robots/2025/cutouts/engineer-2.png", scale: 0.89 }),
        robotRecord("2025", "串联腿步兵", { title: "串联腿步兵", meta: "RMUC 2025 · 步兵", cutout: "assets/images/content/archive/gallery/robots/2025/cutouts/infantry-series-4.png", photo: "assets/images/content/archive/gallery/robots/2025/cutouts/infantry-series-4.png", scale: 0.97 }),
        robotRecord("2025", "并联腿步兵", { title: "并联腿步兵", meta: "RMUC 2025 · 步兵", cutout: "assets/images/content/archive/gallery/robots/2025/cutouts/infantry-parallel-3.png", photo: "assets/images/content/archive/gallery/robots/2025/cutouts/infantry-parallel-3.png", scale: 0.98 }),
        robotRecord("2025", "全向轮步兵", { title: "全向轮步兵", meta: "RMUC 2025 · 步兵", cutout: "assets/images/content/archive/gallery/robots/2025/cutouts/infantry-omni-5.png", photo: "assets/images/content/archive/gallery/robots/2025/cutouts/infantry-omni-5.png", scale: 1.03 }),
        robotRecord("2025", "空中机器人", { title: "空中机器人", meta: "RMUC 2025 · 空中机器人", cutout: "assets/images/content/archive/gallery/robots/2025/cutouts/drone-6.png", photo: "assets/images/content/archive/gallery/robots/2025/cutouts/drone-6.png", scale: 0.84 }),
        robotRecord("2025", "哨兵", { title: "哨兵机器人", meta: "RMUC 2025 · 哨兵", cutout: "assets/images/content/archive/gallery/robots/2025/cutouts/sentry-7.png", photo: "assets/images/content/archive/gallery/robots/2025/cutouts/sentry-7.png", scale: 1.03 }),
        robotRecord("2025", "摩擦轮飞镖", { title: "摩擦轮飞镖", meta: "RMUC 2025 · 飞镖", cutout: "assets/images/content/archive/gallery/robots/2025/cutouts/dart-8.png", photo: "assets/images/content/archive/gallery/robots/2025/cutouts/dart-8.png", scale: 0.89 }),
        robotRecord("2025", "雷达机器人", { title: "雷达机器人", meta: "RMUC 2025 · 雷达", cutout: "assets/images/content/archive/gallery/robots/2025/cutouts/radar-9.png", photo: "assets/images/content/archive/gallery/robots/2025/cutouts/radar-9.png", scale: 0.92 })
      ]
    },
    {
      id: "2024",
      label: "RMUC 2024",
      description: "2024 赛季历次赛事与迭代阵容。选择机器人查看定妆照和贡献记录。",
      robots: [
        robotRecord("2024", "双摩擦英雄【联盟赛】", { title: "双摩擦英雄", meta: "RMUC 2024 · 联盟赛", cutout: "assets/images/content/archive/gallery/robots/2024/additions/alliance-hero.png", photo: "assets/images/content/archive/gallery/robots/2024/additions/alliance-hero.png", scale: 0.92 }),
        robotRecord("2024", "贰點伍摩擦英雄【分区赛】", { title: "贰點伍摩擦英雄", meta: "RMUC 2024 · 分区赛", cutout: "assets/images/content/archive/gallery/robots/2024/additions/division-hero.png", photo: "assets/images/content/archive/gallery/robots/2024/additions/division-hero.png", scale: 0.92 }),
        robotRecord("2024", "三摩擦英雄【复活赛】", { title: "三摩擦英雄", meta: "RMUC 2024 · 复活赛", cutout: "assets/images/content/archive/gallery/robots/2024/cutouts/hero-1.png", photo: "assets/images/content/archive/gallery/robots/2024/photos/hero-1.jpg", scale: 1.37 }),
        robotRecord("2024", "工程机器人", { title: "工程机器人", meta: "RMUC 2024 · 工程", cutout: "assets/images/content/archive/gallery/robots/2024/cutouts/engineer-2.png", photo: "assets/images/content/archive/gallery/robots/2024/photos/engineer-2.jpg", scale: 1.36 }),
        robotRecord("2024", "麦轮步兵", { title: "麦轮步兵", meta: "RMUC 2024 · 备车", cutout: "assets/images/content/archive/gallery/robots/2024/additions/mecanum-infantry.png", photo: "assets/images/content/archive/gallery/robots/2024/additions/mecanum-infantry.png", scale: 0.92 }),
        robotRecord("2024", "全向轮步兵", { title: "全向轮步兵", meta: "RMUC 2024 · 步兵", cutout: "assets/images/content/archive/gallery/robots/2024/cutouts/infantry-4-reserve.png", photo: "assets/images/content/archive/gallery/robots/2024/photos/infantry-4-reserve.jpg", scale: 1.24 }),
        robotRecord("2024", "初代舵轮步兵【联盟赛】", { title: "初代舵轮步兵", meta: "RMUC 2024 · 联盟赛", cutout: "assets/images/content/archive/gallery/robots/2024/additions/alliance-steer.jpg", photo: "assets/images/content/archive/gallery/robots/2024/additions/alliance-steer.jpg", scale: 0.9 }),
        robotRecord("2024", "舵轮步兵【分区赛】", { title: "舵轮步兵", meta: "RMUC 2024 · 分区赛", cutout: "assets/images/content/archive/gallery/robots/2024/additions/division-steer.png", photo: "assets/images/content/archive/gallery/robots/2024/additions/division-steer.png", scale: 0.92 }),
        robotRecord("2024", "白舵轮步兵【复活赛】", { title: "白舵轮步兵", meta: "RMUC 2024 · 复活赛", cutout: "assets/images/content/archive/gallery/robots/2024/cutouts/infantry-3.png", photo: "assets/images/content/archive/gallery/robots/2024/photos/infantry-3.jpg", scale: 1.34 }),
        robotRecord("2024", "黑舵轮步兵【复活赛】", { title: "黑舵轮步兵", meta: "RMUC 2024 · 复活赛", cutout: "assets/images/content/archive/gallery/robots/2024/cutouts/infantry-4.png", photo: "assets/images/content/archive/gallery/robots/2024/photos/infantry-4.jpg", scale: 1.38 }),
        robotRecord("2024", "初代平衡步兵【复活赛】", { title: "初代平衡步兵", meta: "RMUC 2024 · 复活赛", cutout: "assets/images/content/archive/gallery/robots/2024/cutouts/infantry-5.png", photo: "assets/images/content/archive/gallery/robots/2024/photos/infantry-5.jpg", scale: 1.47 }),
        robotRecord("2024", "空中机器人", { title: "空中机器人", meta: "RMUC 2024 · 空中机器人", cutout: "assets/images/content/archive/gallery/robots/2024/cutouts/drone-6.png", photo: "assets/images/content/archive/gallery/robots/2024/photos/drone-6.jpg", scale: 0.94 }),
        robotRecord("2024", "双头哨兵机器人", { title: "双头哨兵机器人", meta: "RMUC 2024 · 哨兵", cutout: "assets/images/content/archive/gallery/robots/2024/cutouts/sentry-7.png", photo: "assets/images/content/archive/gallery/robots/2024/photos/sentry-7.jpg", scale: 1.41 }),
        robotRecord("2024", "飞镖机器人", { title: "飞镖机器人", meta: "RMUC 2024 · 飞镖", cutout: "assets/images/content/archive/gallery/robots/2024/cutouts/dart-8.png", photo: "assets/images/content/archive/gallery/robots/2024/photos/dart-8.jpg", scale: 1 }),
        robotRecord("2024", "雷达机器人", { title: "雷达机器人", meta: "RMUC 2024 · 雷达", cutout: "assets/images/content/archive/gallery/robots/2024/cutouts/radar-9.png", photo: "assets/images/content/archive/gallery/robots/2024/photos/radar-9.jpg", scale: 0.98 })
      ]
    },
    {
      id: "2023",
      label: "RMUC 2023",
      description: "2023 赛季机器人阵容。图片标注已清理，档案信息来自历代阵容展示表。",
      robots: [
        robotRecord("2023", "英雄机器人", { title: "英雄机器人", meta: "RMUC 2023 · 英雄", cutout: "assets/images/content/archive/gallery/robots/2023/photos/hero-1.jpg", photo: "assets/images/content/archive/gallery/robots/2023/photos/hero-1.jpg", scale: 1.28, shiftX: "-5%", shiftY: "-3%" }),
        robotRecord("2023", "工程机器人", { title: "工程机器人", meta: "RMUC 2023 · 工程", cutout: "assets/images/content/archive/gallery/robots/2023/photos/engineer-2.jpg", photo: "assets/images/content/archive/gallery/robots/2023/photos/engineer-2.jpg", scale: 1.02, shiftX: "-4%" }),
        robotRecord("2023", "3号步兵机器人", { title: "3号步兵机器人", meta: "RMUC 2023 · 步兵", cutout: "assets/images/content/archive/gallery/robots/2023/photos/infantry-3.png", photo: "assets/images/content/archive/gallery/robots/2023/photos/infantry-3.png", scale: 1.32, shiftX: "-4%", shiftY: "-4%" }),
        robotRecord("2023", "4号步兵机器人", { title: "4号步兵机器人", meta: "RMUC 2023 · 步兵", cutout: "assets/images/content/archive/gallery/robots/2023/photos/infantry-4.png", photo: "assets/images/content/archive/gallery/robots/2023/photos/infantry-4.png", scale: 1.5, shiftY: "-3%" }),
        robotRecord("2023", "5号步兵机器人", { title: "5号步兵机器人", meta: "RMUC 2023 · 步兵", cutout: "assets/images/content/archive/gallery/robots/2023/photos/infantry-5.jpg", photo: "assets/images/content/archive/gallery/robots/2023/photos/infantry-5.jpg", scale: 1.34, shiftX: "-4%", shiftY: "-4%" }),
        robotRecord("2023", "空中机器人", { title: "空中机器人", meta: "RMUC 2023 · 空中机器人", cutout: "assets/images/content/archive/gallery/robots/2023/photos/drone-6.jpg", photo: "assets/images/content/archive/gallery/robots/2023/photos/drone-6.jpg", scale: 1.08, shiftX: "-3%" }),
        robotRecord("2023", "哨兵机器人", { title: "哨兵机器人", meta: "RMUC 2023 · 哨兵", cutout: "assets/images/content/archive/gallery/robots/2023/photos/sentry-7.jpg", photo: "assets/images/content/archive/gallery/robots/2023/photos/sentry-7.jpg", scale: 1.18, shiftX: "-2%", shiftY: "-2%" }),
        robotRecord("2023", "飞镖机器人", { title: "飞镖机器人", meta: "RMUC 2023 · 飞镖", cutout: "assets/images/content/archive/gallery/robots/2023/photos/dart-8.png", photo: "assets/images/content/archive/gallery/robots/2023/photos/dart-8.png", scale: 1.2, shiftX: "-8%", shiftY: "-2%" })
      ]
    }
  ],
  collections: {
    portraits: [
      {
        title: "RM 2026 高校联盟赛重庆站合影",
        meta: "2026 · 高校联盟赛重庆站",
        preview: "assets/images/content/about/history/recent/2026-rmul-team-a.jpg",
        photo: "assets/images/content/about/history/recent/2026-rmul-team-a.jpg",
        photos: [
          { src: "assets/images/content/about/history/recent/2026-rmul-team-a.jpg", alt: "RM 2026 高校联盟赛重庆站队伍合影", meta: "队伍合影" },
          { src: "assets/images/content/about/history/recent/2026-rmul-team-b.jpg", alt: "RM 2026 高校联盟赛重庆站参赛成员与机器人合影", meta: "参赛成员与机器人" }
        ],
        serviceLabel: "拍摄时间",
        record: "【简介】重庆大学千里战队参加 RM 2026 高校联盟赛重庆站期间，在同一场地拍摄的两组队伍与机器人合影。【服役周期】2026 年 · 高校联盟赛重庆站"
      },
      {
        title: "RMUC 2025 中部分区赛",
        meta: "2025 · 长沙贺龙体育馆",
        preview: "assets/images/content/archive/gallery/team-photos/previews/2025-central-division-he-long.jpg",
        photo: "assets/images/content/archive/gallery/team-photos/originals/2025-central-division-he-long.jpg",
        serviceLabel: "拍摄时间",
        record: "【简介】重庆大学千里战队参加 RMUC 2025 超级对抗赛中部分区赛期间的队伍合照。【服役周期】2025 年 · 长沙贺龙体育馆"
      },
      {
        title: "RMUC 2024 复活赛",
        meta: "2024 · 深圳春茧体育馆",
        preview: "assets/images/content/archive/gallery/team-photos/previews/2024-revival-shenzhen-spring-cocoon.jpg",
        photo: "assets/images/content/archive/gallery/team-photos/originals/2024-revival-shenzhen-spring-cocoon.jpg",
        serviceLabel: "拍摄时间",
        record: "【简介】重庆大学千里战队参加 RMUC 2024 全国总决赛阶段复活赛期间的队伍合照。【服役周期】2024 年 · 深圳春茧体育馆"
      },
      {
        title: "RMUC 2024 南部分区赛",
        meta: "2024 · 长沙贺龙体育馆",
        preview: "assets/images/content/archive/gallery/team-photos/previews/2024-south-division-he-long.jpg",
        photo: "assets/images/content/archive/gallery/team-photos/originals/2024-south-division-he-long.jpg",
        serviceLabel: "拍摄时间",
        record: "【简介】重庆大学千里战队参加 RMUC 2024 超级对抗赛南部分区赛期间的队伍合照。【服役周期】2024 年 · 长沙贺龙体育馆"
      },
      {
        title: "2022 赛季 MechaX 队伍合照",
        meta: "2022 · 实验室",
        preview: "assets/images/content/archive/gallery/team-photos/previews/2022-mechax-team.jpg",
        photo: "assets/images/content/archive/gallery/team-photos/originals/2022-mechax-team.jpg",
        serviceLabel: "拍摄时间",
        record: "【简介】MechaX 战队 2022 赛季成员合照。【服役周期】2022 年"
      },
      {
        title: "2021 赛季南部邀请赛",
        meta: "2021 · 南部邀请赛",
        preview: "assets/images/content/archive/gallery/team-photos/previews/2021-south-invitational-team.jpg",
        photo: "assets/images/content/archive/gallery/team-photos/originals/2021-south-invitational-team.jpg",
        serviceLabel: "拍摄时间",
        record: "【简介】重庆大学 Allspark 战队参加 2021 赛季南部邀请赛期间的队伍合照。【服役周期】2021 年 · 南部邀请赛"
      },
      {
        title: "2021 赛季联盟赛阶段合照",
        meta: "2021 · 联盟赛阶段",
        preview: "assets/images/content/archive/gallery/team-photos/previews/2021-alliance-stage-team.jpg",
        photo: "assets/images/content/archive/gallery/team-photos/originals/2021-alliance-stage-team.jpg",
        serviceLabel: "拍摄时间",
        record: "【简介】重庆大学 Allspark 战队在 2021 赛季联盟赛阶段拍摄的队伍合照。【服役周期】2021 年 · 联盟赛阶段"
      },
      {
        title: "2018 赛季队伍合照",
        meta: "2018 · 重庆大学",
        preview: "assets/images/content/archive/gallery/team-photos/previews/2018-season-team.jpg",
        photo: "assets/images/content/archive/gallery/team-photos/originals/2018-season-team.jpg",
        serviceLabel: "拍摄时间",
        record: "【简介】重庆大学 Allspark 战队 2018 赛季成员合照。【服役周期】2018 年"
      },
      {
        title: "RM 2017 西部赛区合照",
        meta: "2017 · 西部赛区",
        preview: "assets/images/content/archive/gallery/team-photos/previews/2017-west-division-team.jpg",
        photo: "assets/images/content/archive/gallery/team-photos/originals/2017-west-division-team.jpg",
        photos: [
          { src: "assets/images/content/archive/gallery/team-photos/originals/2017-west-division-team.jpg", alt: "重庆大学 Allspark 战队 RM 2017 西部赛区合照", meta: "Allspark 战队合照" },
          { src: "assets/images/content/about/history/allspark/2017-awards.jpg", alt: "RM 2017 西部赛区与西安交通大学笃行战队获奖合影", meta: "与西安交通大学笃行战队" }
        ],
        serviceLabel: "拍摄时间",
        record: "【简介】重庆大学 Allspark 战队在 RM 2017 西部赛区同一场地拍摄的两组照片，其中一张为战队合照，另一张为与西安交通大学笃行战队的获奖队伍合影。【服役周期】2017 年 · 西部赛区"
      }
    ],
    exchange: [
      {
        season: "2026",
        title: "百团纳新",
        meta: "2026 · 校园招新",
        preview: "assets/images/content/archive/gallery/exchange/2026/recruitment-fair-01-preview.webp",
        photo: "assets/images/content/archive/gallery/exchange/2026/recruitment-fair-01.webp",
        photos: activityPhotoSeries(
          "exchange",
          "recruitment-fair",
          [{ code: "26_C001", meta: "招新展位与机器人展示" }],
          "2026 百团纳新"
        ),
        serviceLabel: "活动赛季",
        record: "【简介】千里战队参加百团纳新的现场记录，展示招新展位与机器人。【服役周期】2026 赛季"
      },
      {
        season: "2026",
        title: "运动会",
        meta: "2026 · 线下活动",
        preview: "assets/images/content/archive/gallery/exchange/2026/sports-day-01-preview.webp",
        photo: "assets/images/content/archive/gallery/exchange/2026/sports-day-01.webp",
        photos: activityPhotoSeries(
          "exchange",
          "sports-day",
          [
            { code: "26_C002", meta: "队伍合影" },
            { code: "26_C003", meta: "运动会入场展示" },
            { code: "26_C004", meta: "机器人外场记录" }
          ],
          "2026 运动会"
        ),
        serviceLabel: "活动赛季",
        record: "【简介】千里战队参加运动会的集体合影、入场展示与机器人外场记录。【服役周期】2026 赛季"
      },
      {
        season: "2026",
        title: "创新教育与科学教育活动",
        meta: "2026 · 两江新区",
        preview: "assets/images/content/archive/gallery/exchange/2026/liangjiang-science-education-01-preview.webp",
        photo: "assets/images/content/archive/gallery/exchange/2026/liangjiang-science-education-01.webp",
        photos: activityPhotoSeries(
          "exchange",
          "liangjiang-science-education",
          [
            { code: "26_C005", meta: "机器人户外展示" },
            { code: "26_C006", meta: "科学教育互动现场" },
            { code: "26_C007", meta: "学生体验与交流" },
            { code: "26_C008", meta: "活动展台全景" }
          ],
          "2026 创新教育与科学教育活动"
        ),
        serviceLabel: "活动赛季",
        record: "【简介】2026 年重庆市创新教育教研工作会、两江新区科学教育大会暨南开两江中学第五届科技节现场记录。【服役周期】2026 赛季"
      },
      {
        season: "2026",
        title: "南渝中学第六届科技节",
        meta: "2026 · 沙坪坝区科技活动周",
        preview: "assets/images/content/archive/gallery/exchange/2026/nanyu-science-festival-01-preview.webp",
        photo: "assets/images/content/archive/gallery/exchange/2026/nanyu-science-festival-01.webp",
        photos: activityPhotoSeries(
          "exchange",
          "nanyu-science-festival",
          [
            { code: "26_C009", meta: "科技节机器人展台" },
            { code: "26_C010", meta: "参展机器人展示" }
          ],
          "2026 南渝中学第六届科技节"
        ),
        serviceLabel: "活动赛季",
        record: "【简介】南渝中学第六届科技节暨沙坪坝区科技活动周的机器人展示记录。【服役周期】2026 赛季"
      },
      {
        season: "2026",
        title: "大连民族大学 CONE 战队聂启翔同学到访",
        meta: "2026 · 校际交流",
        preview: "assets/images/content/archive/gallery/exchange/2026/cone-visit-01-preview.webp",
        photo: "assets/images/content/archive/gallery/exchange/2026/cone-visit-01.webp",
        photos: activityPhotoSeries(
          "exchange",
          "cone-visit",
          [{ code: "26_C011", meta: "聂启翔同学到访合影" }],
          "大连民族大学 CONE 战队聂启翔同学到访"
        ),
        serviceLabel: "活动赛季",
        record: "【简介】大连民族大学 CONE 战队聂启翔同学到访千里战队的交流合影。【服役周期】2026 赛季"
      },
      {
        season: "2026",
        title: "上海交通大学交龙战队蓝敏源老师到访",
        meta: "2026 · 校际交流",
        preview: "assets/images/content/archive/gallery/exchange/2026/jiaolong-visit-01-preview.webp",
        photo: "assets/images/content/archive/gallery/exchange/2026/jiaolong-visit-01.webp",
        photos: activityPhotoSeries(
          "exchange",
          "jiaolong-visit",
          [
            { code: "26_C012", meta: "蓝敏源老师与队员交流" },
            { code: "26_C013", meta: "实验室参观交流" }
          ],
          "上海交通大学交龙战队蓝敏源老师到访"
        ),
        serviceLabel: "活动赛季",
        record: "【简介】上海交通大学交龙战队蓝敏源老师到访千里战队，开展队员交流与实验室参观。【服役周期】2026 赛季"
      }
    ],
    designs: [
      {
        category: "characters",
        title: "千里 IP 设定细化",
        meta: "2026–至今 · 角色设定与衍生",
        preview: "assets/images/content/archive/gallery/designs/ip-2026-08.png",
        photo: "assets/images/content/archive/gallery/designs/ip-2026-08.png",
        photos: [
          { src: "assets/images/content/archive/gallery/designs/ip-2026-08.png", alt: "千里 IP 完整角色设定", meta: "角色完成稿", credit: "OnlyPupPet" },
          { src: "assets/images/content/archive/gallery/designs/ip-2026-01.png", alt: "千里 IP 角色探索稿", meta: "角色探索", credit: "OnlyPupPet" },
          { src: "assets/images/content/archive/gallery/designs/ip-2026-02.png", alt: "千里 IP 角色设定长图", meta: "设定整理", credit: "OnlyPupPet" },
          { src: "assets/images/content/archive/gallery/designs/ip-2026-03.png", alt: "千里 IP 服装方案", meta: "服装方案", credit: "OnlyPupPet" },
          { src: "assets/images/content/archive/gallery/designs/ip-2026-04.png", alt: "千里 IP 机械细节设定", meta: "机械细节", credit: "OnlyPupPet" },
          { src: "assets/images/content/archive/gallery/designs/ip-2026-06.png", alt: "千里 IP 绘制过程", meta: "绘制过程", credit: "OnlyPupPet" },
          { src: "assets/images/content/archive/gallery/designs/ip-2026-07.png", alt: "千里 IP 场景绘制过程", meta: "场景探索", credit: "OnlyPupPet" }
        ],
        credit: "OnlyPupPet",
        serviceLabel: "设计周期",
        record: "【简介】在初始视觉方向上继续完成角色结构、服装、机械细节与衍生场景的系统化设定，形成当前千里 IP 的主要视觉面貌。【服役周期】2026 年 5 月 27 日至今【角色设定与绘制】OnlyPupPet"
      },
      {
        category: "characters",
        title: "千里 IP 初始设定",
        meta: "2025 · 初始视觉提案",
        preview: "assets/images/content/archive/gallery/designs/ip-2025-initial.png",
        photo: "assets/images/content/archive/gallery/designs/ip-2025-initial.png",
        credit: "光锥视觉",
        serviceLabel: "设计周期",
        record: "【简介】围绕千里战队的机器人文化与青年工程师形象完成的初始角色视觉提案，为后续角色细化与衍生创作建立方向。【服役周期】2025 年【角色设计】光锥视觉"
      },
      {
        category: "logos",
        title: "千里文创图标档案",
        meta: "历届 · 字形与图标",
        preview: "assets/images/content/archive/gallery/designs/creative-icons-01.webp",
        photo: "assets/images/content/archive/gallery/designs/creative-icons-01.webp",
        photos: designPhotoSet(
          "creative-icons",
          [
            { meta: "千里文字图标", credit: "侯钊凯" },
            { meta: "千里文字标识", credit: "千里战队视觉档案" },
            { meta: "队伍旧口号字形", credit: "千里战队视觉档案" }
          ],
          "千里文创图标档案"
        ),
        credit: "侯钊凯 · 队史资料",
        serviceLabel: "归档范围",
        record: "【简介】收录千里战队历届文字标识、口号字形与文创图标，保存队伍视觉语言演变中的基础素材。【服役周期】历届视觉档案【图标设计】侯钊凯及历届视觉资料"
      },
      {
        category: "posters",
        title: "招新与动员海报",
        meta: "2025–2026 · 招新与赛季动员",
        preview: "assets/images/content/archive/gallery/designs/campaign-visuals-04.webp",
        photo: "assets/images/content/archive/gallery/designs/campaign-visuals-04.webp",
        photos: designPhotoSet(
          "campaign-visuals",
          [
            { file: 1, meta: "2025 招新海报", credit: "邓涵尹" },
            { file: 3, meta: "2026 年 1 月动员大会海报", credit: "鄢政" },
            { file: 4, meta: "2026 年 8 月宣传海报", credit: "鄢政 · OnlyPupPet" },
            { file: 8, meta: "招新海报", credit: "李嘉昊" }
          ],
          "千里招新与动员海报"
        ),
        credit: "鄢政 · OnlyPupPet · 邓涵尹 · 李嘉昊",
        serviceLabel: "归档范围",
        record: "【简介】收录不同阶段的招新、动员与赛季宣传海报，呈现千里战队面向新成员和校内外受众的视觉表达。【服役周期】2025 至 2026 年【视觉设计】鄢政、邓涵尹、李嘉昊【人物线稿】OnlyPupPet"
      },
      {
        category: "posters",
        title: "宣传册与展陈物料",
        meta: "2025–2026 · 宣传册与易拉宝",
        preview: "assets/images/content/archive/gallery/designs/campaign-visuals-05.webp",
        photo: "assets/images/content/archive/gallery/designs/campaign-visuals-05.webp",
        photos: designPhotoSet(
          "campaign-visuals",
          [
            { file: 2, meta: "2025 易拉宝", credit: "邓涵尹" },
            { file: 5, meta: "2026 宣传册正面", credit: "鄢政" },
            { file: 6, meta: "2026 宣传册背面", credit: "鄢政" },
            { file: 7, meta: "2026 易拉宝", credit: "徐锦苑" }
          ],
          "千里宣传册与展陈物料"
        ),
        credit: "鄢政 · 徐锦苑 · 邓涵尹",
        serviceLabel: "归档范围",
        record: "【简介】收录用于校内展示、招新咨询和赛事传播的宣传册与易拉宝，将长篇信息组织为便于现场阅读的展陈物料。【服役周期】2025 至 2026 年【视觉设计】鄢政、徐锦苑、邓涵尹"
      },
      {
        category: "posters",
        title: "技术组介绍海报",
        meta: "2026 · 五个技术方向",
        preview: "assets/images/content/archive/gallery/designs/campaign-visuals-10.webp",
        photo: "assets/images/content/archive/gallery/designs/campaign-visuals-10.webp",
        photos: designPhotoSet(
          "campaign-visuals",
          [
            { file: 10, meta: "宣传运营组介绍海报", credit: "鄢政" },
            { file: 11, meta: "机械结构组介绍海报", credit: "鄢政" },
            { file: 12, meta: "电气控制组介绍海报", credit: "鄢政" },
            { file: 13, meta: "硬件开发组介绍海报", credit: "鄢政" },
            { file: 14, meta: "视觉算法组介绍海报", credit: "鄢政" }
          ],
          "千里技术组介绍海报"
        ),
        credit: "鄢政",
        serviceLabel: "归档范围",
        record: "【简介】以统一版式介绍宣传运营、机械结构、电气控制、硬件开发和视觉算法五个技术方向，便于招新沟通和岗位认识。【服役周期】2026 年【视觉设计】鄢政"
      },
      {
        category: "posters",
        title: "运营模板与证书",
        meta: "2025–2026 · 日常传播模板",
        preview: "assets/images/content/archive/gallery/designs/campaign-visuals-09.webp",
        photo: "assets/images/content/archive/gallery/designs/campaign-visuals-09.webp",
        photos: designPhotoSet(
          "campaign-visuals",
          [
            { file: 9, meta: "日历播报模板", credit: "邓涵尹" },
            { file: 15, meta: "队伍证书模板", credit: "侯钊凯" },
            { file: 16, meta: "赛事预告模板", credit: "邓涵尹" }
          ],
          "千里运营模板与证书"
        ),
        credit: "邓涵尹 · 侯钊凯",
        serviceLabel: "归档范围",
        record: "【简介】收录日历播报、赛事预告和队伍证书等可复用模板，为日常运营建立统一且高效的视觉工具。【服役周期】2025 至 2026 年【视觉设计】邓涵尹、侯钊凯"
      },
      {
        category: "logos",
        title: "千里战队视觉语言",
        meta: "品牌系统 · 组别识别",
        preview: "assets/images/content/archive/gallery/designs/visual-language-01.webp",
        photo: "assets/images/content/archive/gallery/designs/visual-language-01.webp",
        photos: designPhotoSet(
          "visual-language",
          [
            { meta: "千里元素设计语言", credit: "李嘉昊" },
            { meta: "千里头像", credit: "李嘉昊" },
            { meta: "宣传运营组标识", credit: "李嘉昊" },
            { meta: "机械结构组标识", credit: "李嘉昊" },
            { meta: "渐变背景", credit: "李嘉昊" },
            { meta: "电气控制组标识", credit: "李嘉昊" },
            { meta: "硬件开发组标识", credit: "李嘉昊" },
            { meta: "暗色背景", credit: "李嘉昊" },
            { meta: "亮色背景", credit: "李嘉昊" },
            { meta: "视觉算法组标识", credit: "李嘉昊" }
          ],
          "千里战队视觉语言"
        ),
        credit: "李嘉昊",
        serviceLabel: "归档范围",
        record: "【简介】由队伍基础图形、组别标识、头像与明暗背景构成的视觉系统，为网站、宣传物料与赛季设计提供统一语言。【服役周期】队伍现行视觉体系【视觉设计】李嘉昊"
      },
      {
        category: "uniforms",
        title: "27 赛季开季文化衫",
        meta: "2026 年 9 月 · 开季文化衫",
        preview: "assets/images/content/archive/gallery/designs/uniform-2027-opening-01.webp",
        photo: "assets/images/content/archive/gallery/designs/uniform-2027-opening-01.webp",
        credit: "鄢政",
        serviceLabel: "发布批次",
        record: "【简介】千里战队 27 赛季开季文化衫，以黑色短袖承载队伍标识、机器人结构与赛季视觉语言。【服役周期】2026 年 9 月【排版与服装视觉】鄢政"
      },
      {
        category: "uniforms",
        title: "26 赛季联盟赛马甲",
        meta: "2026 年 3 月 · 联盟赛队服",
        preview: "assets/images/content/archive/gallery/designs/vest-2026-league-01.webp",
        photo: "assets/images/content/archive/gallery/designs/vest-2026-league-01.webp",
        credit: "慈之珩",
        serviceLabel: "发布批次",
        record: "【简介】为 26 赛季高校联盟赛阶段制作的队员马甲，将队伍识别与赛场工作需求结合。【服役周期】2026 年 3 月【服装视觉】慈之珩"
      },
      {
        category: "uniforms",
        title: "千里 × 创一联动卫衣",
        meta: "2026 年 1 月 · 联动队服",
        preview: "assets/images/content/archive/gallery/designs/hoodie-2026-collab-full-03.webp",
        photo: "assets/images/content/archive/gallery/designs/hoodie-2026-collab-full-03.webp",
        photos: designPhotoSeries(
          "hoodie-2026-collab-full",
          ["上身效果一", "上身效果二", "版式总览"],
          "鄢政 · 侯钊凯 · SallyPan",
          "千里与创一联动卫衣"
        ),
        credit: "鄢政 · 侯钊凯 · SallyPan",
        serviceLabel: "发布批次",
        record: "【简介】重庆大学千里战队与大连民族大学创一战队共同完成的联动卫衣，将两支队伍的角色 IP 与视觉符号整合进同一套服装语言。【服役周期】2026 年 1 月【主体设计】鄢政【千里 IP】侯钊凯【创一 IP】SallyPan"
      },
      {
        category: "uniforms",
        title: "2025 联盟赛队服",
        meta: "2025 · 分组识别队服",
        preview: "assets/images/content/archive/gallery/designs/uniform-2025-league-05.webp",
        photo: "assets/images/content/archive/gallery/designs/uniform-2025-league-05.webp",
        photos: designPhotoSeries(
          "uniform-2025-league",
          ["宣传运营组", "机械组", "电控组", "硬件组", "队服方案一", "队服方案二", "队服方案三", "视觉组", "设计元素总览"],
          "丁瑞晨",
          "2025 联盟赛队服"
        ),
        credit: "丁瑞晨",
        serviceLabel: "发布批次",
        record: "【简介】2025 联盟赛阶段使用的分组识别队服，通过机械、电控、视觉、硬件与宣运的差异化图形建立清晰的队伍内部识别。【服役周期】2025 年联盟赛阶段【服装视觉】丁瑞晨"
      },
      {
        category: "uniforms",
        title: "2025 赛季队服",
        meta: "2025 年 5 月 · 短袖队服",
        preview: "assets/images/content/archive/gallery/designs/uniform-2025-may-01.webp",
        photo: "assets/images/content/archive/gallery/designs/uniform-2025-may-01.webp",
        photos: designPhotoSeries(
          "uniform-2025-may",
          ["正反面总览", "版式细节一", "版式细节二", "版式细节三", "版式细节四", "版式细节五", "版式细节六"],
          "李嘉昊",
          "2025 年 5 月赛季队服"
        ),
        credit: "李嘉昊",
        serviceLabel: "发布批次",
        record: "【简介】2025 赛季短袖队服设计，以高对比色彩与机器人图形构成当季队伍视觉识别。【服役周期】2025 年 5 月【服装视觉】李嘉昊"
      },
      {
        category: "uniforms",
        title: "2025 赛季兵种马甲",
        meta: "2025 年 5 月 · 兵种识别",
        preview: "assets/images/content/archive/gallery/designs/vest-2025-may-13.webp",
        photo: "assets/images/content/archive/gallery/designs/vest-2025-may-13.webp",
        photos: designPhotoSeries(
          "vest-2025-may",
          ["串联腿步兵成衣方案", "串联腿步兵原图", "哨兵成衣方案", "哨兵原图", "工程成衣方案", "工程原图", "无人机成衣方案", "无人机原图", "平衡步兵原图", "平衡步兵成衣方案", "舵轮步兵成衣方案", "舵轮步兵原图", "英雄成衣方案", "英雄原图", "飞镖成衣方案", "飞镖原图"],
          "鄢政",
          "2025 年 5 月兵种马甲"
        ),
        credit: "鄢政",
        serviceLabel: "发布批次",
        record: "【简介】按英雄、工程、步兵、哨兵、无人机与飞镖等兵种建立的赛场马甲视觉系统，完整保留成衣方案与图形原稿。【服役周期】2025 年 5 月【服装视觉】鄢政"
      },
      {
        category: "uniforms",
        title: "2024 复活赛队服",
        meta: "2024 · 复活赛",
        preview: "assets/images/content/archive/gallery/designs/uniform-2024-playoff-02.webp",
        photo: "assets/images/content/archive/gallery/designs/uniform-2024-playoff-02.webp",
        photos: designPhotoSeries(
          "uniform-2024-playoff",
          ["实物记录", "背部设计稿"],
          "丁瑞晨",
          "2024 复活赛队服"
        ),
        credit: "丁瑞晨",
        serviceLabel: "发布批次",
        record: "【简介】2024 复活赛阶段使用的队服，以机器人线稿、书法字形和千里绿色构成背部主视觉，并保留实物照片作为档案。【服役周期】2024 年复活赛阶段【服装视觉】丁瑞晨"
      }
    ]
  }
};
