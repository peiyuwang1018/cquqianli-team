(() => {
  const solutionData = {
    direct: {
      packaging: "紧凑，但电机位置受转轴约束",
      mass: "零件较少，电机质量靠近关节",
      backlash: "传动链短，回差来源少",
      maintenance: "结构直接，拆装路径短",
      torque: "取决于电机本体，缺少额外减速",
    },
    belt: {
      packaging: "电机位置可调整，需要轮与带的包络",
      mass: "传动件较轻，可把较重电机移向近端",
      backlash: "预紧合适时较小，但受带体弹性影响",
      maintenance: "需要检查张紧、磨损与带轮对齐",
      torque: "可通过轮径比换取转矩与转速",
    },
    chain: {
      packaging: "适合较长中心距，但链路占用空间明显",
      mass: "链轮与链条通常比同步带方案更重",
      backlash: "磨损与松边会增加冲击和间隙",
      maintenance: "需要张紧、润滑与异物防护",
      torque: "抗冲击、承载能力较强",
    },
    gearbox: {
      packaging: "局部集成度高，但减速器本体占据关节包络",
      mass: "功率密度较高，质量集中在关节附近",
      backlash: "取决于减速器类型、精度与磨损状态",
      maintenance: "总成更换直接，内部维修成本较高",
      torque: "能够在紧凑空间获得较高输出转矩",
    },
  };

  const diagnosisData = {
    preload: {
      hypothesis: "轴承预紧或过盈过大，工作温升进一步压缩内部游隙。",
      test: "拆除外部负载，对比冷态启动扭矩、空载电流与温升曲线。",
      evidence: "若空载阻力和电流仍偏高，且温升随运行持续加剧，这一假设获得支持。",
      conclusion: "复核配合、公差与预紧方案，再用同条件测试确认修改是否有效。",
    },
    alignment: {
      hypothesis: "上下轴承座或联轴器不同轴，装配后持续产生附加载荷。",
      test: "逐级释放连接约束，测量同轴度，并比较不同装配状态下的阻力。",
      evidence: "若释放某一连接后阻力明显下降，且测量显示轴线偏差，说明对中是关键变量。",
      conclusion: "统一加工与装配基准，增加确定定位，再复测阻力和温升。",
    },
    friction: {
      hypothesis: "旋转件与防护、线槽或其他静止结构发生持续擦碰。",
      test: "低速手动转动并检查擦痕、异响和局部温升位置。",
      evidence: "稳定出现的周期阻力、擦痕或局部热点能够把问题定位到接触区域。",
      conclusion: "修正间隙与包络，确认全行程、热态和受载状态下不再干涉。",
    },
    motor: {
      hypothesis: "热量主要来自电机工况，而不是 Yaw 轴支撑本身。",
      test: "分别记录电机壳体、轴承座温度与电流，改变控制负载后比较趋势。",
      evidence: "若温升与电流同步变化，且热量从电机侧向结构扩散，电机工况更值得优先检查。",
      conclusion: "复核负载、控制参数与散热路径，并隔离轴系摩擦因素后再次测试。",
    },
    cable: {
      hypothesis: "线束在旋转时被拉紧或擦碰，形成额外阻力并把载荷传回轴系。",
      test: "断开或临时重布线束，对比不同角度下的驱动电流与回正趋势。",
      evidence: "若阻力随角度周期变化，重新布线后现象消失，线束干涉就是主要原因。",
      conclusion: "重新规划走线路径、余量与固定点，并验证全角度运动包络。",
    },
  };

  const initSolutionExplorer = () => {
    const root = document.querySelector("[data-intro-solution]");
    if (!root) return;
    const buttons = [...root.querySelectorAll("[data-intro-solution-option]")];
    const fields = [...root.querySelectorAll("[data-intro-solution-metric]")];
    const render = (key) => {
      const next = solutionData[key];
      if (!next) return;
      buttons.forEach((button) => {
        const active = button.dataset.introSolutionOption === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      fields.forEach((field) => {
        field.textContent = next[field.dataset.introSolutionMetric];
      });
    };
    buttons.forEach((button) => button.addEventListener("click", () => render(button.dataset.introSolutionOption)));
  };

  const initDiagnosis = () => {
    const root = document.querySelector("[data-intro-diagnosis]");
    if (!root) return;
    const buttons = [...root.querySelectorAll("[data-diagnosis-cause]")];
    const fields = {
      hypothesis: root.querySelector("[data-diagnosis-hypothesis]"),
      test: root.querySelector("[data-diagnosis-test]"),
      evidence: root.querySelector("[data-diagnosis-evidence]"),
      conclusion: root.querySelector("[data-diagnosis-conclusion]"),
    };
    const render = (key) => {
      const next = diagnosisData[key];
      if (!next) return;
      buttons.forEach((button) => {
        const active = button.dataset.diagnosisCause === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      Object.entries(fields).forEach(([name, field]) => {
        if (field) field.textContent = next[name];
      });
    };
    buttons.forEach((button) => button.addEventListener("click", () => render(button.dataset.diagnosisCause)));
  };

  initSolutionExplorer();
  initDiagnosis();
})();
