const galleryRecords = window.QIANLI_GALLERY_RECORDS || {};

function robotRecord(season, archiveTitle, robot) {
  const record = galleryRecords[season]?.find((item) => item.title === archiveTitle) || {};
  return { ...robot, archiveTitle, record: record.record || "", legacy: record.legacy || "" };
}

window.QIANLI_GALLERY = {
  seasons: [
    {
      id: "2025",
      label: "RMUC 2025",
      description: "2025 赛季机器人阵容。选择任一机器人查看图片与队史档案。",
      robots: [
        robotRecord("2025", "三摩擦英雄机器人", { title: "三摩擦英雄机器人", meta: "RMUC 2025 · 英雄", cutout: "assets/content/archive/gallery/robots/2025/cutouts/hero-1.png", photo: "assets/content/archive/gallery/robots/2025/cutouts/hero-1.png", scale: 0.97 }),
        robotRecord("2025", "工程机器人", { title: "工程机器人", meta: "RMUC 2025 · 工程", cutout: "assets/content/archive/gallery/robots/2025/cutouts/engineer-2.png", photo: "assets/content/archive/gallery/robots/2025/cutouts/engineer-2.png", scale: 0.89 }),
        robotRecord("2025", "串联腿步兵", { title: "串联腿步兵", meta: "RMUC 2025 · 步兵", cutout: "assets/content/archive/gallery/robots/2025/cutouts/infantry-series-4.png", photo: "assets/content/archive/gallery/robots/2025/cutouts/infantry-series-4.png", scale: 0.97 }),
        robotRecord("2025", "并联腿步兵", { title: "并联腿步兵", meta: "RMUC 2025 · 步兵", cutout: "assets/content/archive/gallery/robots/2025/cutouts/infantry-parallel-3.png", photo: "assets/content/archive/gallery/robots/2025/cutouts/infantry-parallel-3.png", scale: 0.98 }),
        robotRecord("2025", "全向轮步兵", { title: "全向轮步兵", meta: "RMUC 2025 · 步兵", cutout: "assets/content/archive/gallery/robots/2025/cutouts/infantry-omni-5.png", photo: "assets/content/archive/gallery/robots/2025/cutouts/infantry-omni-5.png", scale: 1.03 }),
        robotRecord("2025", "空中机器人", { title: "空中机器人", meta: "RMUC 2025 · 空中机器人", cutout: "assets/content/archive/gallery/robots/2025/cutouts/drone-6.png", photo: "assets/content/archive/gallery/robots/2025/cutouts/drone-6.png", scale: 0.84 }),
        robotRecord("2025", "哨兵", { title: "哨兵机器人", meta: "RMUC 2025 · 哨兵", cutout: "assets/content/archive/gallery/robots/2025/cutouts/sentry-7.png", photo: "assets/content/archive/gallery/robots/2025/cutouts/sentry-7.png", scale: 1.03 }),
        robotRecord("2025", "摩擦轮飞镖", { title: "摩擦轮飞镖", meta: "RMUC 2025 · 飞镖", cutout: "assets/content/archive/gallery/robots/2025/cutouts/dart-8.png", photo: "assets/content/archive/gallery/robots/2025/cutouts/dart-8.png", scale: 0.89 }),
        robotRecord("2025", "雷达机器人", { title: "雷达机器人", meta: "RMUC 2025 · 雷达", cutout: "assets/content/archive/gallery/robots/2025/cutouts/radar-9.png", photo: "assets/content/archive/gallery/robots/2025/cutouts/radar-9.png", scale: 0.92 })
      ]
    },
    {
      id: "2024",
      label: "RMUC 2024",
      description: "2024 赛季历次赛事与迭代阵容。选择机器人查看定妆照和贡献记录。",
      robots: [
        robotRecord("2024", "双摩擦英雄【联盟赛】", { title: "双摩擦英雄", meta: "RMUC 2024 · 联盟赛", cutout: "assets/content/archive/gallery/robots/2024/additions/alliance-hero.png", photo: "assets/content/archive/gallery/robots/2024/additions/alliance-hero.png", scale: 0.92 }),
        robotRecord("2024", "贰點伍摩擦英雄【分区赛】", { title: "贰點伍摩擦英雄", meta: "RMUC 2024 · 分区赛", cutout: "assets/content/archive/gallery/robots/2024/additions/division-hero.png", photo: "assets/content/archive/gallery/robots/2024/additions/division-hero.png", scale: 0.92 }),
        robotRecord("2024", "三摩擦英雄【复活赛】", { title: "三摩擦英雄", meta: "RMUC 2024 · 复活赛", cutout: "assets/content/archive/gallery/robots/2024/cutouts/hero-1.png", photo: "assets/content/archive/gallery/robots/2024/photos/hero-1.jpg", scale: 1.37 }),
        robotRecord("2024", "工程机器人", { title: "工程机器人", meta: "RMUC 2024 · 工程", cutout: "assets/content/archive/gallery/robots/2024/cutouts/engineer-2.png", photo: "assets/content/archive/gallery/robots/2024/photos/engineer-2.jpg", scale: 1.36 }),
        robotRecord("2024", "麦轮步兵", { title: "麦轮步兵", meta: "RMUC 2024 · 备车", cutout: "assets/content/archive/gallery/robots/2024/additions/mecanum-infantry.png", photo: "assets/content/archive/gallery/robots/2024/additions/mecanum-infantry.png", scale: 0.92 }),
        robotRecord("2024", "全向轮步兵", { title: "全向轮步兵", meta: "RMUC 2024 · 步兵", cutout: "assets/content/archive/gallery/robots/2024/cutouts/infantry-4-reserve.png", photo: "assets/content/archive/gallery/robots/2024/photos/infantry-4-reserve.jpg", scale: 1.24 }),
        robotRecord("2024", "初代舵轮步兵【联盟赛】", { title: "初代舵轮步兵", meta: "RMUC 2024 · 联盟赛", cutout: "assets/content/archive/gallery/robots/2024/additions/alliance-steer.jpg", photo: "assets/content/archive/gallery/robots/2024/additions/alliance-steer.jpg", scale: 0.9 }),
        robotRecord("2024", "舵轮步兵【分区赛】", { title: "舵轮步兵", meta: "RMUC 2024 · 分区赛", cutout: "assets/content/archive/gallery/robots/2024/additions/division-steer.png", photo: "assets/content/archive/gallery/robots/2024/additions/division-steer.png", scale: 0.92 }),
        robotRecord("2024", "白舵轮步兵【复活赛】", { title: "白舵轮步兵", meta: "RMUC 2024 · 复活赛", cutout: "assets/content/archive/gallery/robots/2024/cutouts/infantry-3.png", photo: "assets/content/archive/gallery/robots/2024/photos/infantry-3.jpg", scale: 1.34 }),
        robotRecord("2024", "黑舵轮步兵【复活赛】", { title: "黑舵轮步兵", meta: "RMUC 2024 · 复活赛", cutout: "assets/content/archive/gallery/robots/2024/cutouts/infantry-4.png", photo: "assets/content/archive/gallery/robots/2024/photos/infantry-4.jpg", scale: 1.38 }),
        robotRecord("2024", "初代平衡步兵【复活赛】", { title: "初代平衡步兵", meta: "RMUC 2024 · 复活赛", cutout: "assets/content/archive/gallery/robots/2024/cutouts/infantry-5.png", photo: "assets/content/archive/gallery/robots/2024/photos/infantry-5.jpg", scale: 1.47 }),
        robotRecord("2024", "空中机器人", { title: "空中机器人", meta: "RMUC 2024 · 空中机器人", cutout: "assets/content/archive/gallery/robots/2024/cutouts/drone-6.png", photo: "assets/content/archive/gallery/robots/2024/photos/drone-6.jpg", scale: 0.94 }),
        robotRecord("2024", "双头哨兵机器人", { title: "双头哨兵机器人", meta: "RMUC 2024 · 哨兵", cutout: "assets/content/archive/gallery/robots/2024/cutouts/sentry-7.png", photo: "assets/content/archive/gallery/robots/2024/photos/sentry-7.jpg", scale: 1.41 }),
        robotRecord("2024", "飞镖机器人", { title: "飞镖机器人", meta: "RMUC 2024 · 飞镖", cutout: "assets/content/archive/gallery/robots/2024/cutouts/dart-8.png", photo: "assets/content/archive/gallery/robots/2024/photos/dart-8.jpg", scale: 1 }),
        robotRecord("2024", "雷达机器人", { title: "雷达机器人", meta: "RMUC 2024 · 雷达", cutout: "assets/content/archive/gallery/robots/2024/cutouts/radar-9.png", photo: "assets/content/archive/gallery/robots/2024/photos/radar-9.jpg", scale: 0.98 })
      ]
    },
    {
      id: "2023",
      label: "RMUC 2023",
      description: "2023 赛季机器人阵容。图片标注已清理，档案信息来自历代阵容展示表。",
      robots: [
        robotRecord("2023", "英雄机器人", { title: "英雄机器人", meta: "RMUC 2023 · 英雄", cutout: "assets/content/archive/gallery/robots/2023/photos/hero-1.jpg", photo: "assets/content/archive/gallery/robots/2023/photos/hero-1.jpg", scale: 0.94 }),
        robotRecord("2023", "工程机器人", { title: "工程机器人", meta: "RMUC 2023 · 工程", cutout: "assets/content/archive/gallery/robots/2023/photos/engineer-2.jpg", photo: "assets/content/archive/gallery/robots/2023/photos/engineer-2.jpg", scale: 0.92 }),
        robotRecord("2023", "3号步兵机器人", { title: "3号步兵机器人", meta: "RMUC 2023 · 步兵", cutout: "assets/content/archive/gallery/robots/2023/photos/infantry-3.png", photo: "assets/content/archive/gallery/robots/2023/photos/infantry-3.png", scale: 0.94 }),
        robotRecord("2023", "4号步兵机器人", { title: "4号步兵机器人", meta: "RMUC 2023 · 步兵", cutout: "assets/content/archive/gallery/robots/2023/photos/infantry-4.png", photo: "assets/content/archive/gallery/robots/2023/photos/infantry-4.png", scale: 0.94 }),
        robotRecord("2023", "5号步兵机器人", { title: "5号步兵机器人", meta: "RMUC 2023 · 步兵", cutout: "assets/content/archive/gallery/robots/2023/photos/infantry-5.jpg", photo: "assets/content/archive/gallery/robots/2023/photos/infantry-5.jpg", scale: 0.94 }),
        robotRecord("2023", "空中机器人", { title: "空中机器人", meta: "RMUC 2023 · 空中机器人", cutout: "assets/content/archive/gallery/robots/2023/photos/drone-6.jpg", photo: "assets/content/archive/gallery/robots/2023/photos/drone-6.jpg", scale: 0.9 }),
        robotRecord("2023", "哨兵机器人", { title: "哨兵机器人", meta: "RMUC 2023 · 哨兵", cutout: "assets/content/archive/gallery/robots/2023/photos/sentry-7.jpg", photo: "assets/content/archive/gallery/robots/2023/photos/sentry-7.jpg", scale: 0.92 }),
        robotRecord("2023", "飞镖机器人", { title: "飞镖机器人", meta: "RMUC 2023 · 飞镖", cutout: "assets/content/archive/gallery/robots/2023/photos/dart-8.png", photo: "assets/content/archive/gallery/robots/2023/photos/dart-8.png", scale: 0.9 })
      ]
    }
  ]
};
